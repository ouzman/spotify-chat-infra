resource "aws_apigatewayv2_api" "chat_api" {
  name                          = "spotify-chat-chat-api"
  protocol_type                 = "WEBSOCKET"
  route_selection_expression    = "$request.body.action"

  tags = {
    project = "spotify-chat"
  }
}

resource "aws_apigatewayv2_integration" "chat_lambda_integration" {
  api_id           = aws_apigatewayv2_api.chat_api.id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  integration_method        = "POST"
  integration_uri           = var.chat_lambda_invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
}

resource "aws_apigatewayv2_integration" "natch_lambda_integration" {
  api_id           = aws_apigatewayv2_api.chat_api.id
  integration_type = "AWS_PROXY"

  connection_type           = "INTERNET"
  content_handling_strategy = "CONVERT_TO_TEXT"
  integration_method        = "POST"
  integration_uri           = var.match_lambda_invoke_arn
  passthrough_behavior      = "WHEN_NO_MATCH"
}

resource "aws_lambda_permission" "chat_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.chat_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.chat_api.execution_arn}/*/*"
}

resource "aws_apigatewayv2_authorizer" "chat_api_authorizer" {
  api_id           = aws_apigatewayv2_api.chat_api.id
  authorizer_type  = "REQUEST"
  authorizer_uri   = var.api_key_authorizer_lambda_invoke_arn
  identity_sources = ["route.request.header.X-SC-ApiKey"]
  name             = "api-key-authorizer"
}

resource "aws_lambda_permission" "api_key_authorizer_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.api_key_authorizer_lambda_function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.chat_api.execution_arn}/authorizers/${aws_apigatewayv2_authorizer.chat_api_authorizer.id}"
}

resource "aws_apigatewayv2_route" "connect_route" {
  api_id    = aws_apigatewayv2_api.chat_api.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.chat_lambda_integration.id}"

  authorization_type    = "CUSTOM"
  authorizer_id         = aws_apigatewayv2_authorizer.chat_api_authorizer.id
}

resource "aws_apigatewayv2_route" "disconnect_route" {
  api_id    = aws_apigatewayv2_api.chat_api.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.chat_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.chat_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.chat_lambda_integration.id}"
}


resource "aws_apigatewayv2_route" "match_request_route" {
  api_id    = aws_apigatewayv2_api.chat_api.id
  route_key = "MatchRequest"
  target    = "integrations/${aws_apigatewayv2_integration.natch_lambda_integration.id}"
}

resource "aws_apigatewayv2_deployment" "default_deployment" {
  api_id      = aws_apigatewayv2_api.chat_api.id
  description = "Default deployment"

  triggers = {
    redeployment = sha1(
        join(",", 
            list(
                jsonencode(aws_apigatewayv2_api.chat_api), 
                jsonencode(aws_apigatewayv2_route.connect_route), 
                jsonencode(aws_apigatewayv2_route.disconnect_route), 
                jsonencode(aws_apigatewayv2_route.default_route), 
                jsonencode(aws_apigatewayv2_route.match_request_route), 
                var.chat_lambda_invoke_arn,
                var.match_lambda_invoke_arn,
    )))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_apigatewayv2_api.chat_api,
  ]
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id        = aws_apigatewayv2_api.chat_api.id
  name          = "$default"
  deployment_id = aws_apigatewayv2_deployment.default_deployment.id
  auto_deploy   = false
}

data "aws_iam_policy_document" "manage_connections_policy" {
  statement {
    actions = [
      "execute-api:ManageConnections",
    ]
    resources = [
      "${aws_apigatewayv2_api.chat_api.execution_arn}/*",
    ]
    effect = "Allow"
  }
}

resource "aws_iam_policy" "chat_lambda_manage_connections_policy" {
  name   = "spotify_chat_chat_lambda_manage_connections_policy"
  policy = data.aws_iam_policy_document.manage_connections_policy.json
}

resource "aws_iam_role_policy_attachment" "chat_api_chat_lambda_manage_connections_policy_attachment" {
  role       = var.chat_lambda_role_name
  policy_arn = aws_iam_policy.chat_lambda_manage_connections_policy.arn
}

resource "aws_iam_policy" "match_lambda_manage_connections_policy" {
  name   = "spotify_chat_match_lambda_manage_connections_policy"
  policy = data.aws_iam_policy_document.manage_connections_policy.json
}

resource "aws_iam_role_policy_attachment" "chat_api_match_lambda_manage_connections_policy_attachment" {
  role       = var.match_lambda_role_name
  policy_arn = aws_iam_policy.match_lambda_manage_connections_policy.arn
}