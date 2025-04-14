require('dotenv').config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const { handleTwilioCall } = require("./lib/twilioHandler");
const { setupAudioStream } = require("./lib/audio-stream");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/twilio/incoming", handleTwilioCall);

const server = require("http").createServer(app);
setupAudioStream(server);

server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket listening on port ${PORT}`);
});