output "chat_lambda_invoke_arn" {
    value     = aws_lambda_function.chat_lambda.invoke_arn
    sensitive = false
}