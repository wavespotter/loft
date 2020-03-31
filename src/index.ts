import { exec, spawn } from "child-process-promise";
import chalk from "chalk";
import { program } from "commander";
import path from "path";
import fs from "fs";

program
  .option("-t, --terraform-dir <dir>", "terraform directory", "terraform/")
  .option("-a, --auto-approve", "auto-approve terraform changes", false)
  .option(
    "-d, --deploy-env <name>",
    "name of the environment you want to deploy",
    "dev"
  )
  .option(
    "-e, --env-file <path>",
    ".env file you want to load environment variables from"
  )
  .option("--pre-apply <script>", "Script to run before terraform apply")
  .option("--post-apply <script>", "Script to run after terraform apply")
  .parse(process.argv);

async function main() {
  console.log("\n\n");
  const _env = program.deployEnv;
  if (!_env) {
    console.error("--deploy-env must be set.");
    process.exit(1);
  }

  validateTerraformDir();

  // Force env to lowercase so it works with S3 bucket names and other stuff
  const env = _env.toLowerCase();

  console.log(
    `Building and deploying infrastructure for ${chalk.blue.bold(
      env
    )} environment...`
  );

  if (program.envFile) {
    console.log(
      `> Loading environment variables from ${chalk.bold.blue(program.envFile)}`
    );
    require("dotenv").config({ path: program.envFile });
  } else {
    try {
      console.log(
        `> Loading environment variables from ${chalk.bold.blue(`${env}.env`)}`
      );
      require("dotenv").config({ path: `${env}.env` });
    } catch (e) {
      console.warn("No .env file found for this environment.");
    }
  }

  // Run pre-apply scripts
  if (program.preApply) {
    console.log(`> Running pre-apply script`);
    try {
      await spawn(`sh ${program.preApply}`, [], {
        shell: true,
        stdio: "inherit"
      });
    } catch (e) {
      console.error(chalk.red("Pre-apply script failed!"));
      process.exit(1);
    }
  }

  // Initialize terraform and select the correct workspace
  await exec(
    `terraform init
      terraform workspace new ${env}
      terraform workspace select ${env}`,
    { cwd: program.terraformDir }
  );

  // Try to find a .tfvars file that matches the current env
  const defaultVarFile = "dev.tfvars";
  let varFile = path.join(program.terraformDir, `${env}.tfvars`);
  try {
    varFile = fs.statSync(varFile).isFile() ? `${env}.tfvars` : defaultVarFile;
  } catch (e) {
    varFile = defaultVarFile;
  }

  const mode = program.autoApprove ? "auto-approve" : "interactive";
  console.log(
    `> Running ${chalk.yellow(
      "terraform apply"
    )} using variables from ${chalk.blue.bold(varFile)} in ${chalk.green.bold(
      mode
    )} mode`
  );

  // If we're not running in auto-approve mode, just run apply
  try {
    if (!program.autoApprove) {
      await spawn(`terraform apply -var-file="${varFile}"`, [], {
        shell: true,
        cwd: program.terraformDir,
        stdio: "inherit"
      });
    }
    // Otherwise, we need to run plan and then apply
    else {
      await spawn(
        `terraform plan -input=false -out=tfplan -var-file="${varFile}" &&
        terraform apply -input=false -auto-approve tfplan`,
        [],
        { shell: true, cwd: program.terraformDir, stdio: "inherit" }
      );
    }
  } catch (e) {
    console.error(chalk.red("Terraform deploy failed!"));
    process.exit(1);
  }

  // Run post-apply scripts
  if (program.postApply) {
    console.log(`> Running post-apply script`);
    try {
      await spawn(`sh ${program.postApply}`, [], {
        shell: true,
        stdio: "inherit"
      });
    } catch (e) {
      console.error(chalk.red("Post-apply script failed!"));
      process.exit(1);
    }
  }
}

function validateTerraformDir() {
  let terraformDirIsValid = false;
  try {
    terraformDirIsValid = fs.statSync(program.terraformDir).isDirectory();
  } finally {
    if (!terraformDirIsValid) {
      console.error("--terraform-dir must be a directory.");
      process.exit(1);
    }
  }
}

main();
