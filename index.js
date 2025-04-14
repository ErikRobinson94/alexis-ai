const WebSocket = require("ws");
const http = require("http");

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is alive\n");
});

const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  console.log(`[UPGRADE] Request received at: ${req.url}`);

  if (req.url.startsWith("/audio-stream/")) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      const sessionId = req.url.split("/").pop();
      console.log(`[WS] WebSocket connected for session: ${sessionId}`);

      ws.on("message", (msg) => {
        console.log(`[WS] Message from ${sessionId}: ${msg}`);
      });

      ws.on("close", () => {
        console.log(`[WS] Connection closed: ${sessionId}`);
      });
    });
  } else {
    console.log(`[UPGRADE] Invalid path: ${req.url}`);
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Raw WebSocket server listening on port ${PORT}`);
});
