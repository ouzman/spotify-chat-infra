output "conversation_lambda_invoke_arn" {
    value     = aws_lambda_function.conversation_lambda.invoke_arn
    sensitive = false
}

output "conversation_lambda_function_name" {
    value     = aws_lambda_function.conversation_lambda.function_name
    sensitive = false
}

output "conversation_lambda_role_name" {
    value     = aws_iam_role.conversation_lambda_role.name
    sensitive = false
}