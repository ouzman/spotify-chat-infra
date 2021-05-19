resource "aws_apigatewayv2_integration" "chat_lambda_integration" {
  api_id           = var.chat_api_id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  integration_method        = "POST"
  integration_uri           = var.chat_lambda_invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_integration" "match_lambda_integration" {
  api_id           = var.chat_api_id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  integration_method        = "POST"
  integration_uri           = var.match_lambda_invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_integration" "conversation_lambda_integration" {
  api_id           = var.chat_api_id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  integration_method        = "POST"
  integration_uri           = var.conversation_lambda_invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_authorizer" "chat_api_authorizer" {
  api_id           = var.chat_api_id
  authorizer_type  = "REQUEST"
  authorizer_uri   = var.api_key_authorizer_lambda_invoke_arn
  identity_sources = ["route.request.header.X-SC-ApiKey"]
  name             = "api-key-authorizer"
}

resource "aws_apigatewayv2_route" "connect_route" {
  api_id    = var.chat_api_id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.chat_lambda_integration.id}"

  authorization_type    = "CUSTOM"
  authorizer_id         = aws_apigatewayv2_authorizer.chat_api_authorizer.id
}

resource "aws_apigatewayv2_route" "disconnect_route" {
  api_id    = var.chat_api_id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.chat_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = var.chat_api_id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.chat_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "match_route" {
  api_id    = var.chat_api_id
  route_key = "Match"
  target    = "integrations/${aws_apigatewayv2_integration.match_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "conversation_route" {
  api_id    = var.chat_api_id
  route_key = "Conversation"
  target    = "integrations/${aws_apigatewayv2_integration.conversation_lambda_integration.id}"
}

resource "aws_apigatewayv2_deployment" "default_deployment" {
  api_id      = var.chat_api_id
  description = "Default deployment"

  triggers = {
    redeployment = sha1(
        join(",", 
            list(
                var.chat_api_hash,
                jsonencode(aws_apigatewayv2_route.connect_route), 
                jsonencode(aws_apigatewayv2_route.disconnect_route), 
                jsonencode(aws_apigatewayv2_route.default_route), 
                jsonencode(aws_apigatewayv2_route.match_route), 
                jsonencode(aws_apigatewayv2_route.conversation_route), 
                var.chat_lambda_invoke_arn,
                var.match_lambda_invoke_arn,
                var.conversation_lambda_invoke_arn,
    )))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_apigatewayv2_stage" "stage" {
  api_id        = var.chat_api_id
  name          = var.chat_api_stage
  deployment_id = aws_apigatewayv2_deployment.default_deployment.id
  auto_deploy   = false

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit = 50
  }

  route_settings {
    route_key = "Match"
    throttling_burst_limit = 100
    throttling_rate_limit = 50
  }

  route_settings {
    route_key = "Conversation"
    throttling_burst_limit = 100
    throttling_rate_limit = 50
  }
}