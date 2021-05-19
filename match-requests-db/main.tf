resource "aws_dynamodb_table" "match_requests" {
  name           = var.table_name
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
  hash_key       = "SongId"
  range_key      = "RequestDate"

  attribute {
    name = "SongId"
    type = "S"
  }

  attribute {
    name = "RequestDate"
    type = "S"
  }
}
