output "chat_lambda_arn" {
    value       = aws_lambda_function.chat_lambda.arn
    sensitive   = false
}

output "chat_lambda_function_name" {
    value       = aws_lambda_function.chat_lambda.function_name
    sensitive   = false
}
