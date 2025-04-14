require('dotenv').config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const { handleTwilioCall } = require("./lib/twilioHandler");
const { setupAudioStream } = require("./lib/audio-stream");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// HTTP server
const server = http.createServer(app);

// Create WebSocket server outside setupAudioStream
const wss = new WebSocket.Server({ noServer: true });

// Upgrade event for WebSocket handshake
server.on("upgrade", (req, socket, head) => {
  console.log(`[DEBUG] Upgrade request received: ${req.url}`);

  // Only handle upgrades to `/audio-stream/...`
  if (req.url.startsWith("/audio-stream")) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy(); // reject other upgrade paths
  }
});

// Attach WebSocket handlers
setupAudioStream(wss);

// Twilio webhook
app.post("/twilio/incoming", handleTwilioCall);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket listening on port ${PORT}`);
});
