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
  users_db_table_name               = "spotify-chat-users"
  api_keys_db_table_name            = "spotify-chat-api-keys"
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

module "registration_lambda" {
  source                        = "./registration-lambda"
  spotify_client_id             = var.spotify_client_id
  spotify_client_secret         = var.spotify_client_secret
  users_db_table_arn            = module.users_db.users_db_arn
  users_db_table_name           = local.users_db_table_name
  api_keys_db_table_arn         = module.api_keys_db.api_keys_db_arn
  api_keys_db_table_name        = local.api_keys_db_table_name
  spotify_lambda_arn            = module.spotify_lambda.spotify_lambda_arn
  spotify_lambda_function_name  = module.spotify_lambda.spotify_lambda_function_name
}

module "api_key_authorizer_lambda" {
  source                  = "./api-key-authorizer-lambda"
  users_db_table_arn            = module.users_db.users_db_arn
  users_db_table_name           = local.users_db_table_name
  api_keys_db_table_arn         = module.api_keys_db.api_keys_db_arn
  api_keys_db_table_name        = local.api_keys_db_table_name
}

module "login_api" {
  source                    = "./login-api"
  registration_lambda_arn           = module.registration_lambda.registration_lambda_arn
  registration_lambda_function_name = module.registration_lambda.registration_lambda_function_name
}

module "chat_lambda" {
  source = "./chat-lambda"
}

module "chat_api" {
  source = "./chat-api"
  chat_lambda_invoke_arn                    = module.chat_lambda.chat_lambda_invoke_arn
  chat_lambda_function_name                 = module.chat_lambda.chat_lambda_function_name
  api_key_authorizer_lambda_invoke_arn      = module.api_key_authorizer_lambda.api_key_authorizer_lambda_invoke_arn
  api_key_authorizer_lambda_function_name   = module.api_key_authorizer_lambda.api_key_authorizer_lambda_function_name
  chat_lambda_role_name                     = module.chat_lambda.chat_lambda_role_name
}

module "update_currently_playing_source" {
  source = "./update-currently-playing-source"
}

module "update_currently_playing_ecs" {
  source = "./update-currently-playing-ecs"
  users_db_table_arn                          = module.users_db.users_db_arn
  users_db_table_name                         = local.users_db_table_name
  update_currently_playing_source_bucket_arn  = module.update_currently_playing_source.update_currently_playing_source_bucket_arn
  ecs_instance_public_key                     = var.ecs_instance_public_key
}