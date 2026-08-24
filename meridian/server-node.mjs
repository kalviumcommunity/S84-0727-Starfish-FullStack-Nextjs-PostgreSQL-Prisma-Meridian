/**
 * Node.js HTTP server wrapper for TanStack Start Fetch API handler.
 * Used as the start command on Render and other Node.js hosts.
 */
import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = process.env.PORT || 3000;

const handlerModule = await import("./dist/server/server.js");
const handler = handlerModule.default;

const MIME = {
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain",
};

const STATIC_DIR = join(__dirname, "dist/client");

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Serve static files from dist/client
    const staticPath = join(STATIC_DIR, url.pathname);
    try {
      const fileStat = await stat(staticPath);
      if (fileStat.isFile()) {
        const content = await readFile(staticPath);
        const ext = extname(url.pathname).toLowerCase();
        res.writeHead(200, {
          "Content-Type": MIME[ext] || "application/octet-stream",
          "Cache-Control": url.pathname.includes("/assets/")
            ? "public, max-age=31536000, immutable"
            : "no-cache",
        });
        res.end(content);
        return;
      }
    } catch {
      // Not a static file, fall through to SSR handler
    }

    // Collect request body
    const bodyChunks = [];
    for await (const chunk of req) {
      bodyChunks.push(chunk);
    }
    const body =
      bodyChunks.length > 0 && req.method !== "GET" && req.method !== "HEAD"
        ? Buffer.concat(bodyChunks)
        : undefined;

    // Build Fetch API Request
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    // Call the TanStack Start fetch handler
    const response = await handler.fetch(request, {}, {});

    // Write response
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    res.writeHead(response.status, responseHeaders);

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error("[server-node] Unhandled error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain" });
    }
    res.end("Internal Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
