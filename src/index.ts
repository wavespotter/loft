import { program } from "commander";

import deploy from "./deploy";

program
  .command("deploy")
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
  .action(args => deploy(args));

program.parse(process.argv);
