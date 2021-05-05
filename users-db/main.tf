resource "aws_dynamodb_table" "users" {
  name           = var.table_name
  billing_mode   = "PROVISIONED"
  read_capacity  = 2
  write_capacity = 2
  hash_key       = "SpotifyUri"

  attribute {
    name = "SpotifyUri"
    type = "S"
  }
}
