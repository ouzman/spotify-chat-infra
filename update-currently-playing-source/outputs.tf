output "update_currently_playing_source_bucket_arn" {
  value     = aws_s3_bucket.update_currently_playing_source_bucket.arn
  sensitive = false
}