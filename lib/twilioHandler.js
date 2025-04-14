require('dotenv').config();
const AUDIO_STREAM_DOMAIN = process.env.AUDIO_STREAM_DOMAIN;

const handleTwilioCall = async (req, res) => {
  try {
    console.log("[Twilio] Full request body:", JSON.stringify(req.body, null, 2));
    const callSid = req.body.CallSid;
    const streamUrl = `wss://${AUDIO_STREAM_DOMAIN}/audio-stream/${callSid}`;

    console.log(`[Twilio] Generated session: ${callSid}`);
    console.log(`[Twilio] Streaming to: ${streamUrl}`);

    const twiml = `
      <Response>
        <Say voice="Polly.Matthew-Neural" language="en-US">
          Please hold while we connect you to your legal AI agent.
        </Say>
        <Pause length="1"/>
        <Start>
          <Stream url="wss://${AUDIO_STREAM_DOMAIN}/audio-stream/${callSid}" />
        </Start>
      </Response>
    `;

    res.type('text/xml');
    res.send(twiml);

  } catch (error) {
    console.error("[Twilio] Error handling call:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { handleTwilioCall };
