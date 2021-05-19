output "chat_api_id" {
  value = aws_apigatewayv2_api.chat_api.id
  sensitive = false
}

output "chat_api_execution_arn" {
  value = aws_apigatewayv2_api.chat_api.execution_arn
  sensitive = false
}

output "chat_api_hash" {
  value = md5(jsonencode(aws_apigatewayv2_api.chat_api))
  sensitive = false
}
