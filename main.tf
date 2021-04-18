terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.00"
    }
  }
}

provider "aws" {
  profile = "default"
  region  = var.region
}

provider "archive" {}

module "auth_lambda" {
  source = "./auth-lambda"
}

module "login_api" {
  source                    = "./login-api"
  auth_lambda_arn           = module.auth_lambda.auth_lambda_arn
  auth_lambda_function_name = module.auth_lambda.auth_lambda_function_name
}
