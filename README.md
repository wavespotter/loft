# Usage

## `deploy`

```bash
npx @sofarocean/code-loft deploy [--pre-apply <script>] [--post-apply <script>]
```

Running this command from your local machine or on a CI/CD server (such as with Github Actions) will:

- Infer the environment (`dev`, `staging`, or `prod`) frome the current git branch
- Load environment variables from the corresponding .env file for your chosen deploy environment
- Initialize Terraform and select a workspace corresponding to the chosen deploy environment.
- Run your pre-apply script if specified
- Run `terraform apply` with the `.tfvars` corresponding to the chosen deploy environment
- Run your post-apply script if specified

The deployment environment can be overridden with the `-d` or `--deploy-env` option.

For a full list of options, run:

```bash
npx @sofarocean/code-loft deploy -h
```

### On a CI/CD server

When running on a CI/CD server, you can set the `-a` or `--auto-approve` option to auto-approve the Terraform changes.

# TODO

## `promote`

Promote code on `dev`->`staging` or `staging`->`prod`

## `init`

Initialize a project with the standard deployment setup:

- `/terraform` directory with `[dev,staging,prod].tfvars` files
- `[dev,staging,prod].env` files for environment variables in each environment
- Run `git init` if needed
- Create a `dev` and `staging` git branch and checkout `dev`
- Configure git remote repository with default branch `dev`, branch protection, linear history, etc?

## `test`

- Like `deploy`, but set up environment variables before running test command
- Ability to set up temporary terraform stack?

## Other things

- Slack notifications?
