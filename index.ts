import { serve } from "bun";
import index from "./index.html";
import { processCsv } from "./src/features/process-csv/process-csv.POST";
import { downloadFile } from "./src/features/download-file/download-file.GET";


export const server = serve({
  port: 3000,
  websocket: {
    message: (ws, message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        if (parsedMessage.type === "subscribe") {
          ws.subscribe(parsedMessage.room);
        }
      } catch (error) {
        console.log('websocket message', error);
      }
    },
  },

  routes: {
    "/api/process-csv": {
      POST: processCsv,
    },
    "/api/download/:filename": {
      GET: downloadFile,
    },
    "/*": index,
  },

  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/" && req.headers.get("upgrade") === "websocket") {
      const success = server.upgrade(req);
      if (success) {
        return undefined;
      }
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    if (url.pathname.startsWith("/api/download/")) {
      const filename = url.pathname.replace("/api/download/", "");
      const filePath = `data/csv/${filename}`;

      try {
        const file = Bun.file(filePath);
        const exists = await file.exists();

        if (exists) {
          const fileBuffer = await file.arrayBuffer();
          return new Response(fileBuffer, {
            headers: {
              'Content-Type': 'application/zip',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Content-Length': fileBuffer.byteLength.toString(),
            },
          });
        } else {
          return new Response("File not found", { status: 404 });
        }
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
  development: import.meta.env.DEV === 'true',
});

console.log(`Listening on ${server.url}`);