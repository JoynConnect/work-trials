# Task 4: Basic DevOps Setup

This terraform setup is where the infra for this excercise is managed.
It consists of a single general purpose EC2 instance `t2.micro` to host
the an expressJS API (Task 2) and an S3 bucket configured as a "static website"
to serve a ReactJS application (Task 3).

It sets a new VPC, Security Group, Subnet, routing table and internet gateway to isolate it of
any existing configuration in AWS account.

## Setup

Terraform version: `1.8.2`
Terraform state: Local
Workspace: `default`
Required provider: `hashicorp/aws`

### AWS Prerequisites

- A `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` are required for the aws provider to able to
  connect to the environment. Get this by creating a new IAM user and an access key and set them
  as environment variables before running `plan` or `apply` commands.
    - Include `AmazonEC2FullAccess` and `AmazonS3FullAccess` policies.

- A `key pair` from that's used associate it to the ec2 instance in this terraform setup.
  This is for the manual steps to provision the instance with the api dependencies.

### Create the new resources
```
terraform init
terraform plan
terraform apply
```
**Note**: This will create a new local terraform state.

## Post infra deployment
Once the AWS environment is setup, there are a few *manual* steps that need to be followed regarding
the application.

### Provision the EC2 instance
This is the section that requires more manual steps.
**Disclaimer:** and it could be improved by automating all this process and/or
working with ECS and building docker images with all dependencies so that we can deploy containers instead,
but for this excercise let's do this.

1. Manually copy the server app to the instance (I know...). e.g.
   ```
   scp -i ~/.ssh/joyn-pair.pem -r ./ ubuntu@34.237.245.25:~/solution`
   ```

1. SSH into the Instance. Get the public IP from the AWS console instance details. e.g.
    ```
    ssh -i ~/.ssh/joyn-pair.pem ubuntu@34.237.245.25
    ```
1. Install node
   ```
   apt-get update
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.bashrc
   ```
1. Install API dependencies
   ```
   cd ~/solution/api
   nvm install
   nvm use
   npm install
   ```

1. Port forward so that we don’t have to listen as root.
   `sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8080`

1. And Start the application run server, not quite production ready since we haven't set it up
with a process manager like supervisor or pm2 (node).
   ```
   cd ~/solution/api
   nvm use
   node index.js
   ```

### Frontend App deployment
This frontend app is deployed to the S3 bucket configured in this terraform setup. It's done using
githubo workfow and action located in `work-trials/.github/workflows/fullstack_workflow.yml` and
`.github/actions/deploy_assets/action.yml`

It requires to setup A `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` as secrets in the repository.

### Future Improvements
- Automate provisioning of EC2 instance
- Create a different aws access key with enough permissions to upload files.
