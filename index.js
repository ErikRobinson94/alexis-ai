require('dotenv').config();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const { handleTwilioCall } = require("./lib/twilioHandler");
const { setupAudioStream, wss } = require("./lib/audio-stream");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/twilio/incoming", handleTwilioCall);

const server = http.createServer(app);

setupAudioStream(server);

// 🔥 DEBUG: Handle WebSocket upgrades manually and log all paths
server.on("upgrade", (req, socket, head) => {
  console.log(`[UPGRADE] Request for ${req.url}`);

  if (req.url.startsWith("/audio-stream")) {
    console.log(`[UPGRADE] Passing upgrade to wss handler for ${req.url}`);
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    console.log(`[UPGRADE] Unknown path: ${req.url}`);
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 HTTP + WebSocket server listening on port ${PORT}`);
});
