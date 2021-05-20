data "archive_file" "conversation_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/conversation-lambda.zip"
}

data "aws_iam_policy_document" "conversation_lambda_role_policy" {
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

resource "aws_iam_role" "conversation_lambda_role" {
  name               = "spotify_chat_conversation_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.conversation_lambda_role_policy.json

  tags = {
    project = "spotify-chat"
  }
}

data "aws_iam_policy_document" "conversation_lambda_policy" {
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
      "dynamodb:BatchGetItem",
    ]
    resources = [
      var.users_db_table_arn,
      "${var.users_db_table_arn}/index/*",
      var.conversations_db_table_arn,
      "${var.conversations_db_table_arn}/index/*",
      var.connections_db_table_arn,
      "${var.connections_db_table_arn}/index/*",
    ]
    effect = "Allow"
  }

  statement {
    actions = [
      "lambda:InvokeFunction",
    ]
    resources = [
      var.spotify_lambda_arn,
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

resource "aws_iam_role_policy" "conversation_lambda_policy" {
  name   = "spotify_chat_conversation_lambda_policy"
  role   =  aws_iam_role.conversation_lambda_role.id
  policy =  data.aws_iam_policy_document.conversation_lambda_policy.json
}

resource "aws_lambda_function" "conversation_lambda" {
  function_name = "spotify-chat-conversation-lambda"
  role          = aws_iam_role.conversation_lambda_role.arn
  handler       = "conversation-lambda.handler"
  timeout       = 60
  
  filename      = "${path.module}/js/dist/conversation-lambda.zip"
  source_code_hash = data.archive_file.conversation_lambda_archive.output_base64sha256

  runtime = "nodejs14.x"

  environment {
    variables = {
      USERS_DB_TABLE_NAME = var.users_db_table_name,
      CONVERSATIONS_DB_TABLE_NAME = var.conversations_db_table_name,
      SPOTIFY_LAMBDA_FUNCTION_NAME = var.spotify_lambda_function_name,
      CONNECTIONS_DB_TABLE_NAME = var.connections_db_table_name,
      CONNECTIONS_DB_USER_URI_INDEX_NAME = var.connections_db_user_uri_index,
      CHAT_API_ENDPOINT = var.chat_api_endpoint,
    }
  }
  tags = {
    project = "spotify-chat"
  }
}

resource "aws_lambda_permission" "conversation_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.conversation_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.chat_api_execution_arn}/*/*"
}