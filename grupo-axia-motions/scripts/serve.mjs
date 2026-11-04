// Servidor estático mínimo para a prévia (sem dependências).
// Uso: node scripts/serve.mjs [porta]  →  http://localhost:5173/preview/
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 5173);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".png": "image/png", ".json": "application/json", ".mp4": "video/mp4",
  ".webm": "video/webm", ".mov": "video/quicktime",
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (path === "/") { res.writeHead(302, { Location: "/preview/" }); return res.end(); }
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404); res.end("não encontrado");
  }
}).listen(port, () => console.log(`Prévia: http://localhost:${port}/preview/`));
