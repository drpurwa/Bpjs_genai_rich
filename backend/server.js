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
let TARGET_PHONE_NUMBER = process.env.TARGET_PHONE_NUMBER;

if (!FONNTE_TOKEN || !TARGET_PHONE_NUMBER) {
  console.error("ERROR: Harap lengkapi file .env dengan FONNTE_TOKEN dan TARGET_PHONE_NUMBER");
}

if (TARGET_PHONE_NUMBER) {
    TARGET_PHONE_NUMBER = TARGET_PHONE_NUMBER.replace('whatsapp:', '');
    if (TARGET_PHONE_NUMBER.startsWith('08')) {
        TARGET_PHONE_NUMBER = '62' + TARGET_PHONE_NUMBER.slice(1);
    }
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// IN-MEMORY DATABASE (Message Queue)
// ==========================================
// Menggunakan Array agar pesan tidak tertimpa jika masuk bersamaan
global.incomingMessageQueue = [];

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

app.get('/', (req, res) => {
  res.send('RICH Backend (Queue Version) is running! 🚀');
});

// ==========================================
// 1. API: KIRIM PESAN (OUTGOING)
// ==========================================
app.post('/api/send-message', async (req, res) => {
    const { customerId, message } = req.body;

    console.log(`[OUTGOING] To: ${TARGET_PHONE_NUMBER} | Msg: ${message}`);
    
    try {
        const response = await axios.post('https://api.fonnte.com/send', {
            target: TARGET_PHONE_NUMBER,
            message: message,
            countryCode: '62'
        }, {
            headers: { 'Authorization': FONNTE_TOKEN }
        });

        console.log(`[FONNTE SUCCESS] Status: ${response.data.status}`);
        saveMessage(customerId, 'assistant', message);
        res.json({ success: true, detail: response.data });

    } catch (error) {
        console.error(`[FONNTE FAILED]`, error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// 2. API: POLLING PESAN (INCOMING QUEUE)
// ==========================================
app.get('/api/poll-incoming', (req, res) => {
    // Kirim semua pesan yang ada di antrian, lalu kosongkan antrian
    if (global.incomingMessageQueue.length > 0) {
        const messagesToSend = [...global.incomingMessageQueue];
        global.incomingMessageQueue = []; // Reset queue
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

  // Filter sender jika perlu
  // if (senderNumber !== TARGET_PHONE_NUMBER) return res.end();

  console.log(`[INCOMING] Dari ${senderNumber}: ${incomingMsg}`);

  if (incomingMsg) {
      // Masukkan ke Antrian
      global.incomingMessageQueue.push({
          content: incomingMsg,
          sender: senderNumber,
          timestamp: Date.now()
      });
  }

  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`🚀 Backend (Queue System) berjalan di port ${port}`);
  console.log(`📱 Target: ${TARGET_PHONE_NUMBER}`);
});