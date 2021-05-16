resource "aws_dynamodb_table" "connections" {
  name           = var.table_name
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "ConnectionId"

  attribute {
    name = "ConnectionId"
    type = "S"
  }

  attribute {
    name = "UserUri"
    type = "S"
  }

   global_secondary_index {
    name               = var.user_uri_index
    hash_key           = "UserUri"
    range_key          = "ConnectionId"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "KEYS_ONLY"
  }
}
