FROM docker.io/oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM docker.io/oven/bun:latest
WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    espeak \
    espeak-data \
    libespeak1 \
    libespeak-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install gtts --break-system-packages

COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/ankispeak /app/ankispeak
COPY --from=builder /app/public /app/public
COPY --from=builder /app/index.html /app/index.html

EXPOSE 3000
CMD ["/app/ankispeak"]