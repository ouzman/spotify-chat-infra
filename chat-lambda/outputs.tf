output "chat_lambda_invoke_arn" {
    value     = aws_lambda_function.chat_lambda.invoke_arn
    sensitive = false
}

output "chat_lambda_function_name" {
    value     = aws_lambda_function.chat_lambda.function_name
    sensitive = false
}

output "chat_lambda_role_name" {
    value     = aws_iam_role.chat_lambda_role.name
    sensitive = false
}