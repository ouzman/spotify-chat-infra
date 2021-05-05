resource "aws_dynamodb_table" "api_keys" {
  name           = var.table_name
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "ApiKey"

  attribute {
    name = "ApiKey"
    type = "S"
  }

  attribute {
    name = "SpotifyUri"
    type = "S"
  }
}
