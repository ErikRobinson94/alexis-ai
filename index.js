require('dotenv').config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { handleTwilioCall } = require("./lib/twilioHandler");
const { setupAudioStream } = require("./lib/audio-stream");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Route
app.post("/twilio/incoming", handleTwilioCall);

// HTTPS Server
const server = https.createServer(
  {
    key: fs.existsSync(path.join(__dirname, "certs", "key.pem"))
      ? fs.readFileSync(path.join(__dirname, "certs", "key.pem"))
      : undefined,
    cert: fs.existsSync(path.join(__dirname, "certs", "cert.pem"))
      ? fs.readFileSync(path.join(__dirname, "certs", "cert.pem"))
      : undefined,
  },
  app
);

// Fallback to HTTP server if no certs (e.g., in production)
if (!server.key || !server.cert) {
  console.log("🔓 No SSL certs found, falling back to plain HTTP.");
  server = require("http").createServer(app);
}

// Upgrade handler for WebSocket upgrade
server.on("upgrade", (req, socket, head) => {
  console.log(`[DEBUG] Upgrade request received: ${req.url}`);
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

// Setup WebSocket server
const wss = setupAudioStream(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket listening on port ${PORT}`);
});
