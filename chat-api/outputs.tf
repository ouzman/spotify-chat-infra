output "chat_api_execution_arn" {
  value       = aws_apigatewayv2_api.chat_api.execution_arn
  sensitive   = false
}

output "chat_api_endpoint" {
  value       = aws_apigatewayv2_api.chat_api.api_endpoint
  sensitive   = false
}