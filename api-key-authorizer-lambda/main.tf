data "archive_file" "api_key_authorizer_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/api-key-authorizer-lambda.zip"
}

resource "aws_iam_role" "api_key_authorizer_lambda_role" {
  name = "spotify_chat_api_key_authorizer_lambda_role"

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

resource "aws_iam_role_policy" "api_key_authorizer_lambda_policy" {
  name        = "spotify_chat_api_key_authorizer_lambda_policy"
  role        =  aws_iam_role.api_key_authorizer_lambda_role.id
  policy = <<EOF
{
  "Version": "2012-10-17",

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

resource "aws_lambda_function" "api_key_authorizer_lambda" {
  function_name = "spotify-chat-api-key-authorizer-lambda"
  role          = aws_iam_role.api_key_authorizer_lambda_role.arn
  handler       = "api-key-authorizer-lambda.handler"
  
  filename      = "${path.module}/js/dist/api-key-authorizer-lambda.zip"
  source_code_hash = data.archive_file.api_key_authorizer_lambda_archive.output_base64sha256

  runtime = "nodejs12.x"

  environment {
    variables = {
      USERS_DB_TABLE_NAME = var.users_db_table_name,
      API_KEYS_DB_TABLE_NAME = var.api_keys_db_table_name,
    }
  }
  tags = {
    project = "spotify-chat"
  }
}