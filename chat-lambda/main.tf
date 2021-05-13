data "aws_caller_identity" "current" {}

data "archive_file" "chat_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/chat-lambda.zip"
}

resource "aws_iam_role" "chat_lambda_role" {
  name = "spotify_chat_chat_lambda_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
  tags = {
    project = "spotify-chat"
  }
}

resource "aws_iam_role_policy" "chat_lambda_policy" {
  name        = "spotify_chat_chat_lambda_policy"
  role        =  aws_iam_role.chat_lambda_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    },
    {
      "Action": [
        "sqs:SendMessage",
      ],
      "Resource": "arn:aws:sqs:*:*:${var.client_response_queue_queue_name}",
      "Effect": "Allow"
    }
  ]
}
EOF
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