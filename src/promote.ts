import { exec, spawn } from "child-process-promise";
import chalk from "chalk";
import inquirer from "inquirer";

export default async function promote(args: any, currentBranch: string) {
  if (!args.target) {
    die("No target branch specified.");
  }

  const { stdout: changes } = await exec(
    `git log ${args.target}..${currentBranch} --color --pretty=format:"%h %<(50,trunc)%Cgreen%s %Creset[%an]"`
  );

  // Check to make sure the target branch is an ancestor of the current branch
  try {
    await exec(`git merge-base --is-ancestor ${args.target} ${currentBranch}`);
  } catch (e) {
    let message = `Cannot promote: Branch '${currentBranch}' is not a descendent of '${args.target}'.`;
    const maybeBackwards =
      (currentBranch === "staging" && args.target === "dev") ||
      (currentBranch === "master" &&
        (args.target === "staging" || args.target === "dev"));
    if (maybeBackwards) {
      message += `Did you mean to promote '${args.target}' to target branch '${currentBranch}'?`;
    } else {
      message += `\n\nIf there was a hotfix on the '${args.target}' branch, you may need to back-merge it before continuing.`;
      //message += `\n\nTo back-merge, use 'npx @sofarocean/loft back-merge --from ${args.target}'`;
      message += `\n\nTo back-merge, use 'git merge ${args.target}'`;
    }

    die(message);
  }

  // Make sure there are changes to apply
  if (changes.trim() == "") {
    console.log(chalk.green.bold("Everything up to date!"));
    process.exit(0);
  }

  console.log(
    `\n🎖 Promoting the following changes from ${chalk.cyan.bold(
      currentBranch
    )} 👉 ${chalk.cyan.bold(args.target)}...\n`
  );

  console.log(changes + "\n");

  // Ask for confirmation
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are these the changes you want to promote?`,
      default: false
    }
  ]);

  if (!confirm) {
    die("Promotion aborted.");
  }

  console.log(
    `\nPerforming a fast-forward merge to bring ${args.target} up to ${currentBranch}...`
  );
  // Try ff-only merge
  try {
    const { stdout, stderr } = await exec(
      `git checkout ${args.target} && git merge --ff-only ${currentBranch}`
    );
  } catch (e) {
    console.log(e.stdout);
    console.log(e.stderr);
    die("Promotion failed: could not perform fast-forward merge.");
  } finally {
    await exec(`git checkout ${currentBranch}`);
  }

  console.log(`Pushing changes to origin...`);
  // Try to push changes
  try {
    const { stdout, stderr } = await exec(
      `git checkout ${args.target} && git push origin ${args.target}`
    );
  } catch (e) {
    console.log(e.stdout);
    console.log(e.stderr);
    die("Promotion failed: could not push to origin.");
  } finally {
    await exec(`git checkout ${currentBranch}`);
  }

  console.log(`\n🎖 ${chalk.green.bold("Promotion complete!")} 🌟`);
}

function die(msg: string) {
  console.error(chalk.red.bold(msg));
  process.exit(1);
}
