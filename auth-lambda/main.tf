data "archive_file" "auth_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/auth-lambda.zip"
}

resource "aws_iam_role" "auth_lambda_role" {
  name = "spotify_chat_auth_lambda_role"

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

resource "aws_iam_role_policy" "auth_lambda_policy" {
  name        = "spotify_chat_auth_lambda_policy"
  role        =  aws_iam_role.auth_lambda_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
          "lambda:InvokeFunction"
      ],
      "Resource": [
          "${var.spotify_lambda_arn}"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query"
      ],
      "Resource": [
          "${var.users_db_table_arn}",
          "${var.users_db_table_arn}/index/*",
          "${var.api_keys_db_table_arn}",
          "${var.api_keys_db_table_arn}/index/*"
      ],
      "Effect": "Allow"
    },
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_lambda_function" "auth_lambda" {
  function_name = "spotify-chat-auth-lambda"
  role          = aws_iam_role.auth_lambda_role.arn
  handler       = "auth-lambda.handler"
  
  filename      = "${path.module}/js/dist/auth-lambda.zip"
  source_code_hash = data.archive_file.auth_lambda_archive.output_base64sha256

  runtime = "nodejs12.x"

  environment {
    variables = {
      SPOTIFY_CLIENT_ID = var.spotify_client_id,
      SPOTIFY_CLIENT_SECRET = var.spotify_client_secret,
      USERS_DB_TABLE_NAME = var.users_db_table_name,
      API_KEYS_DB_TABLE_NAME = var.api_keys_db_table_name
    }
  }
  tags = {
    project = "spotify-chat"
  }
}