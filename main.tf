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
  users_db_table_name            = "spotify-chat-users"
  api_keys_db_table_name         = "spotify-chat-api-keys"
  api_keys_db_user_uri_index     = "user-uri-index"
  connections_db_table_name      = "spotify-chat-connections"
  connections_db_user_uri_index  = "user-uri-index"
  match_requests_db_table_name   = "spotify-chat-match-requests"
  conversations_db_table_name    = "spotify-chat-conversations"
}

module "users_db" {
  source      = "./users-db"
  table_name  = local.users_db_table_name
}

module "api_keys_db" {
  source          = "./api-keys-db"
  table_name      = local.api_keys_db_table_name
  user_uri_index  = local.api_keys_db_user_uri_index
}

module "connections_db" {
  source         = "./connections-db"
  table_name     = local.connections_db_table_name
  user_uri_index = local.connections_db_user_uri_index
}

module "spotify_lambda" {
  source                = "./spotify-lambda"
  spotify_client_id     = var.spotify_client_id
  spotify_client_secret = var.spotify_client_secret
}

module "registration_lambda" {
  source                        = "./registration-lambda"
  users_db_table_arn            = module.users_db.users_db_arn
  users_db_table_name           = local.users_db_table_name
  api_keys_db_table_arn         = module.api_keys_db.api_keys_db_arn
  api_keys_db_table_name        = local.api_keys_db_table_name
  api_keys_db_user_uri_index    = local.api_keys_db_user_uri_index
  spotify_lambda_arn            = module.spotify_lambda.spotify_lambda_arn
  spotify_lambda_function_name  = module.spotify_lambda.spotify_lambda_function_name
}

module "api_key_authorizer_lambda" {
  source                 = "./api-key-authorizer-lambda"
  users_db_table_arn     = module.users_db.users_db_arn
  users_db_table_name    = local.users_db_table_name
  api_keys_db_table_arn  = module.api_keys_db.api_keys_db_arn
  api_keys_db_table_name = local.api_keys_db_table_name
}

module "login_api" {
  source                    = "./login-api"
  registration_lambda_arn           = module.registration_lambda.registration_lambda_arn
  registration_lambda_function_name = module.registration_lambda.registration_lambda_function_name
}

module "chat_lambda" {
  source              = "./chat-lambda"
  connections_db_table_arn      = module.connections_db.connections_db_arn
  connections_db_table_name     = local.connections_db_table_name
  connections_db_user_uri_index = local.connections_db_user_uri_index
}

module "conversations_db" {
  source      = "./conversations-db"
  table_name  = local.conversations_db_table_name
}

module "conversation_lambda" {
  source                        = "./conversation-lambda"
  users_db_table_arn            = module.users_db.users_db_arn
  users_db_table_name           = local.users_db_table_name
  conversations_db_table_arn    = module.conversations_db.conversations_db_arn
  conversations_db_table_name   = local.conversations_db_table_name
  spotify_lambda_arn            = module.spotify_lambda.spotify_lambda_arn
  spotify_lambda_function_name  = module.spotify_lambda.spotify_lambda_function_name
  connections_db_table_arn      = module.connections_db.connections_db_arn
  connections_db_table_name     = local.connections_db_table_name
  connections_db_user_uri_index = local.connections_db_user_uri_index
}

module "match_requests_db" {
  source      = "./match-requests-db"
  table_name  = local.match_requests_db_table_name
}

module "match_lambda" {
  source                            = "./match-lambda"
  users_db_table_arn                = module.users_db.users_db_arn
  users_db_table_name               = local.users_db_table_name
  match_requests_db_table_arn       = module.match_requests_db.matches_db_arn
  match_requests_db_table_name      = local.match_requests_db_table_name
  conversation_lambda_arn           = module.conversation_lambda.conversation_lambda_arn
  conversation_lambda_function_name = module.conversation_lambda.conversation_lambda_function_name
}

module "chat_api" {
  source = "./chat-api"
  chat_lambda_invoke_arn                    = module.chat_lambda.chat_lambda_invoke_arn
  chat_lambda_function_name                 = module.chat_lambda.chat_lambda_function_name
  chat_lambda_role_name                     = module.chat_lambda.chat_lambda_role_name

  match_lambda_invoke_arn                   = module.match_lambda.match_lambda_invoke_arn
  match_lambda_function_name                = module.match_lambda.match_lambda_function_name
  match_lambda_role_name                    = module.match_lambda.match_lambda_role_name

  conversation_lambda_invoke_arn            = module.conversation_lambda.conversation_lambda_invoke_arn
  conversation_lambda_function_name         = module.conversation_lambda.conversation_lambda_function_name
  conversation_lambda_role_name             = module.conversation_lambda.conversation_lambda_role_name

  api_key_authorizer_lambda_invoke_arn      = module.api_key_authorizer_lambda.api_key_authorizer_lambda_invoke_arn
  api_key_authorizer_lambda_function_name   = module.api_key_authorizer_lambda.api_key_authorizer_lambda_function_name
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
  update_currently_playing_source_etag        = module.update_currently_playing_source.update_currently_playing_source_etag
  connections_db_table_arn                    = module.connections_db.connections_db_arn
  connections_db_table_name                   = local.connections_db_table_name
  connections_db_user_uri_index               = local.connections_db_user_uri_index
  spotify_lambda_arn                          = module.spotify_lambda.spotify_lambda_arn
  spotify_lambda_function_name                = module.spotify_lambda.spotify_lambda_function_name
}