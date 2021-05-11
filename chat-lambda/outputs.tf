output "chat_lambda_invoke_arn" {
    value       = aws_lambda_function.chat_lambda.invoke_arn
    sensitive   = false
}

output "chat_lambda_function_name" {
    value       = aws_lambda_function.chat_lambda.function_name
    sensitive   = false
}
