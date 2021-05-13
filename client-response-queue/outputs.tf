output "client_response_queue_arn" {
    value       = aws_sqs_queue.client_response_queue.arn
    sensitive   = false
}