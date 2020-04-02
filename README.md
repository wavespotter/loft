## **`loft`** is a set of command line utilities that provide a standard way of managing and deploying infrastructure and code across multiple environments using git, Github, and Terraform.

[![Lofting](https://upload.wikimedia.org/wikipedia/commons/4/4a/Cecil_Beaton_Photographs-_Tyneside_Shipyards%2C_1943_DB88.jpg)](https://en.wikipedia.org/wiki/Lofting)
_"[**Lofting**](https://en.wikipedia.org/wiki/Lofting) is a drafting technique whereby curved lines are generated, to be used in plans for streamlined objects such as aircraft and boats."_

# Usage

`loft` is published on [`npm`](https://www.npmjs.com/) and can be executed anywhere with [`npx`](https://www.npmjs.com/package/npx):

```bash
npx @sofarocean/loft
```

## Alias

If you find yourself using `loft` frequently from the command line, you can create an alias by adding an entry to your `~/.profile`, `~/.bashrc`, or similar:

```bash
alias loft='npx @sofarocean/loft'
```

And then running commands from any directory such as:

```bash
loft deploy
```

# Commands

## `deploy`

```bash
npx @sofarocean/loft deploy [--pre-apply <script>] [--post-apply <script>]
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
npx @sofarocean/loft deploy -h
```

### On a CI/CD server

When running on a CI/CD server, you can set the `-a` or `--auto-approve` option to auto-approve the Terraform changes.

## `promote`

Use `promote` to bring code from one environment up to date with another. This is typically used to promote code on `dev`->`staging` or `staging`->`prod`.

In most cases, you can just run:

```bash
npx @sofarocean/loft promote
```

This will infer the target branch based on your current branch (e.g. if you are currently on `dev`, this will attempt to promote `dev`->`staging`).

You can also specify a target branch:

```bash
npx @sofarocean/loft promote --target master
```

### Preview changelog

Before promoting, `loft` will show you a log of the commits that differ between your current and target branches. Run these by your team before promoting to make sure everything looks good to go!

### Back-merging hotfixes

`promote` will only attempt a fast-forward merge. This will fail if the target branch contains code that is not on the current branch, as is the case when a hotfix was applied directly on the target branch. In this case, you will need to back-merge the changes onto your current branch and resolve any merge conflicts manually before continuing.

Back merging is as simple as:

```bash
git merge <target>
```

where `<target>` was your original target branch.

# TODO

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

## `destroy`

- Wraper for `terraform destroy` that sets variables based on environment and branch, similar to `loft deploy`

## Other things

- Slack notifications?
