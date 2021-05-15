
data "aws_iam_policy_document" "update_currently_playing_task_role_policy" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]
    principals {
      type            = "Service"
      identifiers     = ["ecs-tasks.amazonaws.com"]
    }
    effect = "Allow"
  }
}

resource "aws_iam_role" "update_currently_playing_task_role" {
  name = "update_currently_playing_task_role"

  assume_role_policy = data.aws_iam_policy_document.update_currently_playing_task_role_policy.json

  tags = {
    project = "spotify-chat"
  }
}

data "aws_iam_policy_document" "update_currently_playing_task_policy" {
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
      "s3:GetObject",
      "s3:GetObjectVersion",
    ]
    resources = [
      "${var.update_currently_playing_source_bucket_arn}",
      "${var.update_currently_playing_source_bucket_arn}/*",
    ]
    effect = "Allow"
  }
}

resource "aws_iam_role_policy" "update_currently_playing_task_policy" {
  name      = "update_currently_playing_task_policy"
  role      = aws_iam_role.update_currently_playing_task_role.id
  policy    = data.aws_iam_policy_document.update_currently_playing_task_policy.json
}

resource "aws_ecs_task_definition" "update_currently_playing_task" {
  family                = "update_currently_playing_task"
  container_definitions = templatefile("${path.module}/json/container-definitions.json", { usersDbTableName: var.users_db_table_name })
  task_role_arn         = aws_iam_role.update_currently_playing_task_role.arn
}