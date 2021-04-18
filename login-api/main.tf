resource "aws_apigatewayv2_api" "login_api" {
  name          = "spotify-chat-login-api"
  protocol_type = "HTTP"
  body          = templatefile("${path.module}/api/openapi.yaml", { integrationInvokeArn: var.auth_lambda_arn })

  tags = {
    project = "spotify-chat"
  }
}

resource "aws_lambda_permission" "auth_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.auth_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_apigatewayv2_api.login_api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id = aws_apigatewayv2_api.login_api.id
  name   = "$default"
}

resource "aws_apigatewayv2_deployment" "default_deployment" {
  api_id      = aws_apigatewayv2_api.login_api.id
  description = "Default deployment"

  triggers = {
    redeployment = sha1(
        join(",", 
            list(jsonencode(aws_apigatewayv2_api.login_api), 
            var.auth_lambda_arn, 
            file("${path.module}/api/openapi.yaml"),
    )))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_apigatewayv2_api.login_api,
  ]
}