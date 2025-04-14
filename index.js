require('dotenv').config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { handleTwilioCall } = require("./lib/twilioHandler");
const { setupAudioStream, wss } = require("./lib/audio-stream");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.post("/twilio/incoming", handleTwilioCall);

// HTTPS server (we're on Railway, so we don’t use certs here)
const server = https.createServer({}, app);

// WebSocket setup
setupAudioStream(server);

// Explicitly handle WebSocket upgrade requests
server.on("upgrade", (request, socket, head) => {
  const pathname = request.url;

  if (pathname.startsWith("/audio-stream")) {
    console.log(`[DEBUG] Handling WebSocket upgrade for ${pathname}`);
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket listening on port ${PORT}`);
});
