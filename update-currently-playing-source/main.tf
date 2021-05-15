data "archive_file" "update_currently_playing_source_archive" {
  type        = "zip"
  source_dir = "${path.module}/js/src"
  output_path = "${path.module}/js/dist/update-currently-playing.zip"
}

resource "aws_s3_bucket" "update_currently_playing_source_bucket" {
  bucket = "update-currently-playing-source-code"
  acl    = "private"
}

resource "aws_s3_bucket_object" "update_currently_playing_source_archive" {
  bucket  = aws_s3_bucket.update_currently_playing_source_bucket.bucket
  key     = "source-archive"
  source  = data.archive_file.update_currently_playing_source_archive.output_path
  etag    = data.archive_file.update_currently_playing_source_archive.output_md5
}