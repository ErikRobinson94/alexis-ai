const WebSocket = require("ws");

function setupAudioStream(server) {
  const wss = new WebSocket.Server({ noServer: true });

  console.log("💬 WebSocket server initialized (noServer mode)");

  wss.on("connection", (ws, req) => {
    const sessionId = req.url?.split("/").pop();
    console.log(`[WS] New connection: ${sessionId}`);

    ws.on("message", (msg) => {
      console.log(`[WS] Message from ${sessionId}: ${msg.length} bytes`);
    });

    ws.on("close", () => {
      console.log(`[WS] Closed connection: ${sessionId}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error on ${sessionId}:`, err);
    });
  });

  return wss;
}

module.exports = { setupAudioStream };
