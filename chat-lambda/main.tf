data "archive_file" "chat_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/chat-lambda.zip"
}

data "aws_iam_policy_document" "chat_lambda_role_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type            = "Service"
      identifiers     = ["lambda.amazonaws.com"]
    }
    effect = "Allow"
  }
}

resource "aws_iam_role" "chat_lambda_role" {
  name = "spotify_chat_chat_lambda_role"

  assume_role_policy = data.aws_iam_policy_document.chat_lambda_role_policy.json

  tags = {
    project = "spotify-chat"
  }
}

data "aws_iam_policy_document" "chat_lambda_policy" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
    resources = [
      "arn:aws:logs:*:*:*",
    ]
    effect = "Allow"
  }
  
  statement {
    actions = [
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
      "dynamodb:Scan",
      "dynamodb:Query",
    ]
    resources = [
      var.connections_db_table_arn,
      "${var.connections_db_table_arn}/index/*",
    ]
    effect = "Allow"
  }

  statement {
    actions = [
      "execute-api:ManageConnections",
    ]
    resources = [
      "${var.chat_api_execution_arn}/*",
    ]
    effect = "Allow"
  }
}

resource "aws_iam_role_policy" "chat_lambda_policy" {
  name      = "spotify_chat_chat_lambda_policy"
  role      = aws_iam_role.chat_lambda_role.id
  policy    = data.aws_iam_policy_document.chat_lambda_policy.json
}

resource "aws_lambda_function" "chat_lambda" {
  function_name = "spotify-chat-chat-lambda"
  role          = aws_iam_role.chat_lambda_role.arn
  handler       = "chat-lambda.handler"
  timeout       = 60

  filename      = "${path.module}/js/dist/chat-lambda.zip"
  source_code_hash = data.archive_file.chat_lambda_archive.output_base64sha256

  runtime = "nodejs14.x"

  environment {
    variables = {
      CONNECTIONS_DB_TABLE_NAME = var.connections_db_table_name,
      CONNECTIONS_DB_USER_URI_INDEX_NAME = var.connections_db_user_uri_index,
      CHAT_API_ENDPOINT = var.chat_api_endpoint,
    }
  }
  tags = {
    project = "spotify-chat"
  }
}

resource "aws_lambda_permission" "chat_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.chat_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.chat_api_execution_arn}/*/*"
}
