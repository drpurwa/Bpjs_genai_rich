require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); // Ganti Twilio dengan Axios

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

// Fonnte tidak butuh prefix 'whatsapp:', tapi butuh nomor format 62 (bukan 08)
// Kita bersihkan format nomor
if (TARGET_PHONE_NUMBER) {
    // Hapus 'whatsapp:' jika ada (sisa config lama)
    TARGET_PHONE_NUMBER = TARGET_PHONE_NUMBER.replace('whatsapp:', '');
    // Ganti 08 di depan dengan 62
    if (TARGET_PHONE_NUMBER.startsWith('08')) {
        TARGET_PHONE_NUMBER = '62' + TARGET_PHONE_NUMBER.slice(1);
    }
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// IN-MEMORY DATABASE (Message Store)
// ==========================================
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

// ==========================================
// 0. HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.send('RICH Backend (Fonnte Version) is running! 🚀');
});

// ==========================================
// 1. API: KIRIM PESAN (VIA FONNTE)
// ==========================================
app.post('/api/send-message', async (req, res) => {
    const { customerId, message } = req.body;

    console.log(`[OUTGOING] To: ${TARGET_PHONE_NUMBER} | Msg: ${message}`);
    
    try {
        const response = await axios.post('https://api.fonnte.com/send', {
            target: TARGET_PHONE_NUMBER,
            message: message,
            countryCode: '62' // Optional, default 62
        }, {
            headers: {
                'Authorization': FONNTE_TOKEN
            }
        });

        console.log(`[FONNTE SUCCESS] Status: ${response.data.status}`);
        
        saveMessage(customerId, 'assistant', message);
        res.json({ success: true, detail: response.data });

    } catch (error) {
        console.error(`[FONNTE FAILED]`, error.response ? error.response.data : error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            provider: 'Fonnte' 
        });
    }
});

// ==========================================
// 2. API: POLLING PESAN
// ==========================================
app.get('/api/messages/:customerId', (req, res) => {
    const { customerId } = req.params;
    const messages = messageStore[customerId] || [];
    res.json({ messages });
});

// ==========================================
// 3. WEBHOOK: TERIMA PESAN DARI FONNTE
// ==========================================
// Pastikan URL Webhook di Dashboard Fonnte diset ke: https://url-railway-anda.app/whatsapp

// A. Handle GET Request (Untuk Verifikasi/Check dari Fonnte)
app.get('/whatsapp', (req, res) => {
    res.status(200).send("Webhook is active. Please use POST method to send data.");
});

// B. Handle POST Request (Data Pesan Masuk yang Sebenarnya)
app.post('/whatsapp', async (req, res) => {
  // Struktur Data Webhook Fonnte
  // { "device": "...", "sender": "628...", "message": "...", "name": "..." }
  
  const incomingMsg = req.body.message; 
  const senderNumber = req.body.sender;

  // Filter: Hanya terima dari nomor target (agar tidak spam dari grup/orang lain)
  // Optional: Uncomment jika ingin strict
  // if (senderNumber !== TARGET_PHONE_NUMBER) return res.end();

  console.log(`[INCOMING] Dari ${senderNumber}: ${incomingMsg}`);

  if (incomingMsg) {
      global.latestIncomingMessage = {
          content: incomingMsg,
          timestamp: Date.now()
      };
  }

  // Fonnte tidak butuh respon TwiML, cukup 200 OK
  res.status(200).send('OK');
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
  console.log(`🚀 Backend (Fonnte) berjalan di port ${port}`);
  console.log(`📱 Target: ${TARGET_PHONE_NUMBER}`);
  console.log(`🔗 Webhook URL untuk Fonnte: https://bpjsgenairich-production.up.railway.app/whatsapp`);
  console.log(`--------------------------------------------------`);
});