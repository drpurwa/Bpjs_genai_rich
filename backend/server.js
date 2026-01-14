require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');
const { MessagingResponse } = twilio.twiml;

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// KONFIGURASI NOMOR TUJUAN
// ==========================================
// Diambil dari file .env. Contoh isi .env:
// TARGET_PHONE_NUMBER=whatsapp:+628123810892
const TARGET_PHONE_NUMBER = process.env.TARGET_PHONE_NUMBER;

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !TARGET_PHONE_NUMBER) {
  console.error("ERROR: Harap lengkapi file .env di folder backend dengan TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, dan TARGET_PHONE_NUMBER");
  process.exit(1);
}

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// IN-MEMORY DATABASE (Message Store)
// ==========================================
const messageStore = {};

// Fungsi helper untuk menyimpan pesan
const saveMessage = (customerId, role, content) => {
  if (!messageStore[customerId]) {
    messageStore[customerId] = [];
  }
  messageStore[customerId].push({
    role, 
    content,
    timestamp: new Date().toISOString()
  });
};

// ==========================================
// 1. API: KIRIM PESAN DARI FRONTEND KE WA
// ==========================================
app.post('/api/send-message', async (req, res) => {
    const { customerId, message } = req.body;

    console.log(`[OUTGOING] Ke ${TARGET_PHONE_NUMBER} (Ref ID: ${customerId}): ${message}`);
    
    try {
        const msg = await twilioClient.messages.create({
            from: 'whatsapp:+14155238886', // Nomor Sandbox Twilio (Default)
            to: TARGET_PHONE_NUMBER,       // Nomor HP dari .env
            body: message
        });

        // Simpan ke history
        saveMessage(customerId, 'assistant', message);

        res.json({ success: true, sid: msg.sid });

    } catch (error) {
        console.error("Twilio Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 2. API: FRONTEND AMBIL PESAN TERBARU (POLLING)
// ==========================================
app.get('/api/messages/:customerId', (req, res) => {
    const { customerId } = req.params;
    const messages = messageStore[customerId] || [];
    res.json({ messages });
});

// ==========================================
// 3. WEBHOOK: TERIMA BALASAN DARI WA ASLI
// ==========================================
app.post('/whatsapp', async (req, res) => {
  const incomingMsg = req.body.Body;
  const senderNumber = req.body.From;

  console.log(`[INCOMING] Dari ${senderNumber}: ${incomingMsg}`);

  // Simpan ke global variable untuk polling
  global.latestIncomingMessage = {
      content: incomingMsg,
      timestamp: Date.now()
  };

  const twiml = new MessagingResponse();
  res.type('text/xml').send(twiml.toString());
});

// Endpoint Polling Frontend
app.get('/api/poll-incoming', (req, res) => {
    if (global.latestIncomingMessage) {
        const msg = global.latestIncomingMessage;
        global.latestIncomingMessage = null;
        res.json({ hasNew: true, content: msg.content });
    } else {
        res.json({ hasNew: false });
    }
});

app.listen(port, () => {
  console.log(`--------------------------------------------------`);
  console.log(`🚀 Backend Server berjalan di port ${port}`);
  console.log(`📱 Target WhatsApp: ${TARGET_PHONE_NUMBER}`);
  console.log(`🔗 Jangan lupa jalankan: ngrok http ${port}`);
  console.log(`--------------------------------------------------`);
});