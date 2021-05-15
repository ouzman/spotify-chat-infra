output "update_currently_playing_source_bucket_arn" {
  value     = aws_s3_bucket.update_currently_playing_source_bucket.arn
  sensitive = false
}

output "update_currently_playing_source_etag" {
  value     = aws_s3_bucket_object.update_currently_playing_source_archive.etag
  sensitive = false
}