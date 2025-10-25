import { serve } from "bun";
import index from "./index.html";


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

    return new Response("Not Found", { status: 404 });
  },
  development: false,
});

console.log(`Listening on ${server.url}`);