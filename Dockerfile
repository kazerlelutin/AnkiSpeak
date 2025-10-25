FROM docker.io/oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM socialengine/nginx-spa:latest

# Copier les fichiers statiques générés
COPY --from=builder /app/public /app/
# Copier le binaire compilé si nécessaire
COPY --from=builder /app/roadcast_layout /app/roadcast_layout
# Copier les templates et données
COPY --from=builder /app/data /app/data