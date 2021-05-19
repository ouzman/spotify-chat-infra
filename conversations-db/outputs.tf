output "conversations_db_arn" {
    value       = aws_dynamodb_table.conversations.arn
    sensitive   = false
}