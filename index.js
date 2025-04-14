require('dotenv').config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const WebSocket = require("ws");
const { handleTwilioCall } = require("./lib/twilioHandler");

const app = express();
const PORT = process.env.PORT || 8080;

// Optional: only needed for local HTTPS testing
const certOptions = process.env.NODE_ENV === "production" ? {} : {
  key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
};

const server = https.createServer(certOptions, app);

// Use body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.post("/twilio/incoming", handleTwilioCall);

// WebSocket setup
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws, req) => {
  const sessionId = req.url.split("/").pop();
  console.log(`🟣 [WS] New WebSocket connection for session: ${sessionId}`);

  ws.on("message", (message) => {
    console.log(`📨 [WS] Received message (${message.length} bytes) from ${sessionId}`);
  });

  ws.on("close", () => {
    console.log(`🔴 [WS] Connection closed for session: ${sessionId}`);
  });

  ws.on("error", (err) => {
    console.error(`❗ [WS] Error on session ${sessionId}:`, err);
  });
});

server.on("upgrade", (req, socket, head) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;

  if (pathname.startsWith("/audio-stream/")) {
    console.log(`[DEBUG] Upgrade request received: ${pathname}`);
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket listening on port ${PORT}`);
});
