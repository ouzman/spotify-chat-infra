resource "aws_dynamodb_table" "users" {
  name           = var.table_name
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "SpotifyUri"

  attribute {
    name = "SpotifyUri"
    type = "S"
  }
}
