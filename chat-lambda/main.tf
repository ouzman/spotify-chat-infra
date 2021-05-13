data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

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
      "sqs:SendMessage",
    ]
    resources = [
      "arn:aws:sqs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${var.client_response_queue_queue_name}"
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
  
  filename      = "${path.module}/js/dist/chat-lambda.zip"
  source_code_hash = data.archive_file.chat_lambda_archive.output_base64sha256

  runtime = "nodejs12.x"

  environment {
    variables = {
      AWS_ACCOUNT_ID = data.aws_caller_identity.current.account_id,
      CLIENT_RESPONSE_QUEUE = var.client_response_queue_queue_name
    }
  }

  tags = {
    project = "spotify-chat"
  }
}