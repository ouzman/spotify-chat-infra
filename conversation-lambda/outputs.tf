output "conversation_lambda_arn" {
    value     = aws_lambda_function.conversation_lambda.arn
    sensitive = false
}

output "conversation_lambda_invoke_arn" {
    value     = aws_lambda_function.conversation_lambda.invoke_arn
    sensitive = false
}

output "conversation_lambda_function_name" {
    value     = aws_lambda_function.conversation_lambda.function_name
    sensitive = false
}