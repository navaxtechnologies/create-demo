const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/" || p === "") p = "/index.html";
    const fp = path.normalize(path.join(ROOT, p));
    if (!fp.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    fs.readFile(fp, (err, data) => {
      if (err) {
        fs.readFile(path.join(ROOT, "index.html"), (e2, idx) => {
          if (e2) {
            res.writeHead(404);
            res.end("not found");
            return;
          }
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(idx);
        });
        return;
      }
      const ext = path.extname(fp).toLowerCase();
      res.writeHead(200, {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
      });
      res.end(data);
    });
  })
  .listen(PORT, () => console.log("Create listening on port " + PORT));
