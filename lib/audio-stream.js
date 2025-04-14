const WebSocket = require("ws");

let wss;

function setupAudioStream(server) {
  wss = new WebSocket.Server({ noServer: true });
  console.log("🔁 WebSocket server initialized with noServer:true");

  wss.on("connection", (ws, req) => {
    const sessionId = req.url.split("/").pop();
    console.log(`[WS] Connected to session: ${sessionId}`);

    ws.on("message", (msg) => {
      console.log(`[WS] Message (${sessionId}): ${msg.toString().substring(0, 50)}...`);
    });

    ws.on("close", () => {
      console.log(`[WS] Closed connection for session: ${sessionId}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] Error on session ${sessionId}:`, err);
    });
  });
}

module.exports = { setupAudioStream, wss };
