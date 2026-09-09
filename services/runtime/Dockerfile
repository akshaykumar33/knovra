FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod ./
COPY internal ./internal
COPY cmd ./cmd

RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/knovra ./cmd/knovra

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /bin/knovra /usr/local/bin/knovra

EXPOSE 8080
ENTRYPOINT ["knovra"]
CMD ["daemon"]
