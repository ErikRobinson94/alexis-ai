require('dotenv').config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const { handleTwilioCall } = require("./lib/twilioHandler");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/twilio/incoming", handleTwilioCall);

// HTTP Server (no HTTPS certs needed for Railway)
const server = http.createServer(app);

// WebSocket server attached to HTTP server
const wss = new WebSocket.Server({ server, path: '/audio-stream' });

console.log("🔁 WebSocket server initialized at /audio-stream");

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

server.listen(PORT, () => {
  console.log(`🔓 Server + WebSocket listening on port ${PORT}`);
});