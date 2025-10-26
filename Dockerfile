# Cache buster - force rebuild
FROM docker.io/oven/bun:1.3 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun build ./src/app.ts --outfile ./public/hydrate.mjs --format esm --minify --target browser && bun build --compile --target=bun-linux-x64  ./index.ts --outfile ankispeak 

FROM docker.io/oven/bun:1.3
WORKDIR /app

COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/ankispeak /app/ankispeak
COPY --from=builder /app/public /app/public
COPY --from=builder /app/index.html /app/index.html

EXPOSE 3000
CMD ["/app/ankispeak"]