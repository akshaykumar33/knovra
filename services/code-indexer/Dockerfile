FROM rust:1.78-alpine AS builder

WORKDIR /usr/src/knovra
RUN apk add --no-cache musl-dev

COPY Cargo.toml ./
COPY crates ./crates

RUN cargo build --release

FROM alpine:3.19
WORKDIR /app
COPY --from=builder /usr/src/knovra/target/release/knovra-indexer-cli /usr/local/bin/knovra-indexer

CMD ["knovra-indexer"]
