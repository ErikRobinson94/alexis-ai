const WebSocket = require('ws');

function setupAudioStream(server) {
  const wss = new WebSocket.Server({ server, path: '/audio-stream' });
  console.log('🔁 WebSocket server initialized at /audio-stream');

  wss.on('connection', function connection(ws, req) {
    const sessionId = req.url.split('/').pop();
    console.log(`[WS] New WebSocket connection for session: ${sessionId}`);

    ws.on('message', function incoming(message) {
      console.log(`[WS] Received message from ${sessionId}: ${message.length} bytes`);
    });

    ws.on('close', () => {
      console.log(`[WS] WebSocket closed for session: ${sessionId}`);
    });

    ws.on('error', (error) => {
      console.error(`[WS] WebSocket error for session: ${sessionId}`, error);
    });
  });
}

module.exports = { setupAudioStream };