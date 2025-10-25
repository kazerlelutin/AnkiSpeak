FROM docker.io/oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM docker.io/oven/bun:latest
WORKDIR /app

COPY --from=builder /app/anki-speak /app/anki-speak
COPY --from=builder /app/public /app/public
COPY --from=builder /app/data /app/data
COPY --from=builder /app/index.html /app/index.html

EXPOSE 3000
CMD ["/app/anki-speak"]