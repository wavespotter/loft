#!/usr/bin/env node
import { exec } from "child-process-promise";
import { program } from "commander";

import deploy from "./deploy";

(async function main() {
  const { stdout: _branch } = await exec("git branch --show-current");
  const branch = sanitizeBranch(_branch);

  program
    .command("deploy")
    .option("-t, --terraform-dir <dir>", "terraform directory", "terraform/")
    .option("-a, --auto-approve", "auto-approve terraform changes", false)
    .option(
      "-d, --deploy-env <name>",
      "name of the environment you want to deploy. Defaults to the current git branch name.",
      branch
    )
    .option(
      "-e, --env-file <path>",
      ".env file you want to load environment variables from"
    )
    .option("--pre-apply <script>", "Script to run before terraform apply")
    .option("--post-apply <script>", "Script to run after terraform apply")
    .action(args => deploy(args, branch));

  program.parse(process.argv);
})();

function sanitizeBranch(branch: string) {
  return branch
    .replace("/", "_")
    .toLowerCase()
    .trim()
    .replace(/^master$/g, "prod");
}
