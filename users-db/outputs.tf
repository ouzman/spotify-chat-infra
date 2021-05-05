output "users_db_arn" {
    value       = aws_dynamodb_table.users.arn
    sensitive   = false
}