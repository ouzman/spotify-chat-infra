output "matches_db_arn" {
    value       = aws_dynamodb_table.match_requests.arn
    sensitive   = false
}