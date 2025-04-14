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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/twilio/incoming", handleTwilioCall);

const server = https.createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
  },
  app
);

// Log any WebSocket upgrade attempts
server.on("upgrade", (req) => {
  console.log(`[DEBUG] Upgrade request received: ${req.url}`);
});

setupAudioStream(server);

server.listen(PORT, () => {
  console.log(`🔐 Server + WebSocket listening on port ${PORT}`);
});
