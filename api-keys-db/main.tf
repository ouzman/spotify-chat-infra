resource "aws_dynamodb_table" "api_keys" {
  name           = var.table_name
  billing_mode   = "PROVISIONED"
  read_capacity  = 3
  write_capacity = 3
  hash_key       = "ApiKey"

  attribute {
    name = "ApiKey"
    type = "S"
  }

  attribute {
    name = "UserUri"
    type = "S"
  }

   global_secondary_index {
    name               = var.user_uri_index
    hash_key           = "UserUri"
    range_key          = "ApiKey"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "KEYS_ONLY"
  }
}
