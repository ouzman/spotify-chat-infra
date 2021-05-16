output "connections_db_arn" {
    value       = aws_dynamodb_table.connections.arn
    sensitive   = false
}