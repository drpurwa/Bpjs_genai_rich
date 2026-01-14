require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// KONFIGURASI FONNTE
// ==========================================
const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
const DEFAULT_TARGET_PHONE = process.env.TARGET_PHONE_NUMBER;

if (!FONNTE_TOKEN) {
  console.error("ERROR: Harap lengkapi file .env dengan FONNTE_TOKEN");
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// IN-MEMORY DATABASE & DEBUG DATA
// ==========================================
global.incomingMessageQueue = [];
global.lastWebhookData = {
    receivedAt: null,
    sender: null,
    message: null,
    rawBody: null
};

const messageStore = {};
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

const formatPhoneNumber = (number) => {
    if (!number) return null;
    let formatted = number.toString().replace(/\D/g, ''); 
    if (formatted.startsWith('08')) {
        formatted = '62' + formatted.slice(1);
    }
    return formatted;
};

app.get('/', (req, res) => {
  res.send('RICH Backend is running! 🚀');
});

// ==========================================
// API DEBUG: CEK KONEKSI WEBHOOK
// ==========================================
app.get('/api/debug', (req, res) => {
    // Endpoint ini dipanggil Frontend untuk cek apakah server pernah terima data Fonnte
    res.json(global.lastWebhookData);
});

// ==========================================
// 1. API: KIRIM PESAN (OUTGOING)
// ==========================================
app.post('/api/send-message', async (req, res) => {
    let { customerId, message, target } = req.body;
    let finalTarget = target ? formatPhoneNumber(target) : formatPhoneNumber(DEFAULT_TARGET_PHONE);

    if (!finalTarget) {
        return res.status(400).json({ success: false, error: "Target phone missing" });
    }

    console.log(`[OUTGOING] To: ${finalTarget} | Msg: ${message}`);
    
    try {
        const response = await axios.post('https://api.fonnte.com/send', {
            target: finalTarget,
            message: message,
            countryCode: '62'
        }, {
            headers: { 'Authorization': FONNTE_TOKEN }
        });

        saveMessage(customerId, 'assistant', message);
        res.json({ success: true, detail: response.data, target_used: finalTarget });

    } catch (error) {
        console.error(`[FONNTE FAILED]`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 2. API: POLLING PESAN (INCOMING QUEUE)
// ==========================================
app.get('/api/poll-incoming', (req, res) => {
    if (global.incomingMessageQueue.length > 0) {
        const messagesToSend = [...global.incomingMessageQueue];
        global.incomingMessageQueue = []; 
        res.json({ hasNew: true, messages: messagesToSend });
    } else {
        res.json({ hasNew: false, messages: [] });
    }
});

// ==========================================
// 3. WEBHOOK (INPUT DARI WA)
// ==========================================
app.get('/whatsapp', (req, res) => {
    res.status(200).send("Webhook active.");
});

app.post('/whatsapp', async (req, res) => {
  const incomingMsg = req.body.message; 
  const senderNumber = req.body.sender;

  // Update Debug Data
  console.log(`[INCOMING WEBHOOK] Dari: ${senderNumber} | Pesan: ${incomingMsg}`);
  global.lastWebhookData = {
      receivedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      sender: senderNumber,
      message: incomingMsg,
      rawBody: req.body // Simpan raw body untuk diagnosa
  };

  if (incomingMsg) {
      global.incomingMessageQueue.push({
          content: incomingMsg,
          sender: senderNumber,
          timestamp: Date.now()
      });
  }

  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`🚀 Backend berjalan di port ${port}`);
});