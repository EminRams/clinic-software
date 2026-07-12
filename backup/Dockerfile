# Small dedicated image for the backup service: has both the
# Postgres client (for pg_dump) and the AWS CLI (for uploading to R2,
# which speaks the S3 API) in a single lightweight Alpine image.
FROM alpine:3.20

RUN apk add --no-cache \
    postgresql16-client \
    aws-cli \
    bash

COPY backup.sh /backup.sh
RUN chmod +x /backup.sh

ENTRYPOINT ["/backup.sh"]
