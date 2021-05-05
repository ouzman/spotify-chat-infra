output "api_keys_db_arn" {
    value       = aws_dynamodb_table.api_keys.arn
    sensitive   = false
}