# Usage

```bash
npx @sofarocean/code-loft --terraform-dir <dirname> --pre-apply <script> --post-apply <script> --deploy-env dev
```

Running this command from your local machine or on a CICD server (such as with Github Actions) will:

- Load environment variables from the corresponding .env file for your chosen deploy environment
- Initialize Terraform and select a workspace corresponding to the chosen deploy environment.
- Run your pre-apply script
- Run `terraform apply` with the `.tfvars` corresponding to the chosen deploy environment
- Run your post-apply script
