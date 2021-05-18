data "archive_file" "match_lambda_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/match-lambda.zip"
}

data "aws_iam_policy_document" "match_lambda_role_policy" {
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

resource "aws_iam_role" "match_lambda_role" {
  name               = "spotify_chat_match_lambda_role"
  assume_role_policy = data.aws_iam_policy_document.match_lambda_role_policy.json

  tags = {
    project = "spotify-chat"
  }
}

data "aws_iam_policy_document" "match_lambda_policy" {
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
      var.users_db_table_arn,
      "${var.users_db_table_arn}/index/*",    
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
}

resource "aws_iam_role_policy" "match_lambda_policy" {
  name   = "spotify_chat_match_lambda_policy"
  role   =  aws_iam_role.match_lambda_role.id
  policy =  data.aws_iam_policy_document.match_lambda_policy.json
}

resource "aws_lambda_function" "match_lambda" {
  function_name = "spotify-chat-match-lambda"
  role          = aws_iam_role.match_lambda_role.arn
  handler       = "match-lambda.handler"
  timeout       = 60
  
  filename      = "${path.module}/js/dist/match-lambda.zip"
  source_code_hash = data.archive_file.match_lambda_archive.output_base64sha256

  runtime = "nodejs12.x"

  environment {
    variables = {
      USERS_DB_TABLE_NAME = var.users_db_table_name,
      SPOTIFY_LAMBDA_FUNCTION_NAME = var.spotify_lambda_function_name,
    }
  }
  tags = {
    project = "spotify-chat"
  }
}