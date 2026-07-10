// Tiny reverse proxy: forwards :8001 -> :3000 so the Kubernetes ingress
// (which routes /api/* to port 8001) reaches our Next.js server on 3000.
const http = require("http");

const TARGET_HOST = "127.0.0.1";
const TARGET_PORT = 3000;
const LISTEN_PORT = 8001;

const server = http.createServer((req, res) => {
  const options = {
    host: TARGET_HOST,
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `${TARGET_HOST}:${TARGET_PORT}` },
  };

  const proxied = http.request(options, (r) => {
    res.writeHead(r.statusCode || 502, r.headers);
    r.pipe(res, { end: true });
  });
  proxied.on("error", (err) => {
    console.error("proxy error:", err.message);
    if (!res.headersSent) res.writeHead(502, { "content-type": "text/plain" });
    res.end("bad gateway");
  });
  req.pipe(proxied, { end: true });
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(`proxy listening on 0.0.0.0:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
