FROM docker.io/oven/bun:latest AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

FROM socialengine/nginx-spa:latest

# Copier les fichiers statiques générés
COPY --from=builder /app/public /app/
# Copier le binaire compilé si nécessaire
COPY --from=builder /app/anki-speak /app/anki-speak
# Copier les templates et données
COPY --from=builder /app/data /app/data

EXPOSE 3000
CMD ["/app/anki-speak"]