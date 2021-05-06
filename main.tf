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

locals {
  users_db_table_name     = "spotify-chat-users"
  api_keys_db_table_name  = "spotify-chat-api-keys"
}

module "users_db" {
  source      = "./users-db"
  table_name  = local.users_db_table_name
}

module "api_keys_db" {
  source      = "./api-keys-db"
  table_name  = local.api_keys_db_table_name
}

module "spotify_lambda" {
  source = "./spotify-lambda"
}

module "auth_lambda" {
  source                  = "./auth-lambda"
  spotify_client_id       = var.spotify_client_id
  spotify_client_secret   = var.spotify_client_secret
  users_db_table_arn      = module.users_db.users_db_arn
  users_db_table_name     = local.users_db_table_name
  api_keys_db_table_arn   = module.api_keys_db.api_keys_db_arn
  api_keys_db_table_name  = local.api_keys_db_table_name
  spotify_lambda_arn      = module.spotify_lambda.spotify_lambda_arn
}

module "login_api" {
  source                    = "./login-api"
  auth_lambda_arn           = module.auth_lambda.auth_lambda_arn
  auth_lambda_function_name = module.auth_lambda.auth_lambda_function_name
}
