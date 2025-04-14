function setupAudioStream(wss) {
  console.log("💬 WebSocket server initialized at /audio-stream");

  wss.on("connection", (ws, req) => {
    const sessionId = req.url?.split("/").pop();
    console.log(`[WS] New WebSocket connection for session: ${sessionId}`);

    ws.on("message", (msg) => {
      console.log(`[WS] Message from ${sessionId}: ${msg.length} bytes`);
    });

    ws.on("close", () => {
      console.log(`[WS] WebSocket closed for session: ${sessionId}`);
    });

    ws.on("error", (err) => {
      console.error(`[WS] WebSocket error for session: ${sessionId}`, err);
    });
  });
}

module.exports = { setupAudioStream };
