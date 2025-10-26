FROM docker.io/oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

FROM docker.io/oven/bun:latest
WORKDIR /app

COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/index.ts /app/index.ts
COPY --from=builder /app/src /app/src
COPY --from=builder /app/public /app/public
COPY --from=builder /app/index.html /app/index.html

EXPOSE 3000
CMD ["bun", "run", "start"]