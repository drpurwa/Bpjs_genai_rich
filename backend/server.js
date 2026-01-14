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
// Fonnte kadang mengirim JSON, kadang urlencoded. Kita handle keduanya.
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
    rawBody: null,
    contentType: null
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
  res.json({ 
    status: 'Rich Backend Online', 
    version: '1.2.0 (Debug Enabled)',
    time: new Date().toISOString() 
  });
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
    res.status(200).send("Webhook active. Please use POST.");
});

app.post('/whatsapp', async (req, res) => {
  const body = req.body;
  const contentType = req.headers['content-type'];
  
  // Log Raw Data ke Console Server (Lihat di Railway Logs)
  console.log(`[WEBHOOK HIT] Content-Type: ${contentType}`);
  console.log(`[BODY]: ${JSON.stringify(body)}`);

  // Simpan data terakhir untuk dilihat di Frontend
  global.lastWebhookData = {
      receivedAt: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      sender: body.sender || "Unknown",
      message: body.message || "No Message Content",
      rawBody: body,
      contentType: contentType
  };

  // Logic Proses Pesan
  // Fonnte kadang kirim 'message', kadang 'data.message' tergantung setting
  const incomingMsg = body.message || (body.data ? body.data.message : null); 
  const senderNumber = body.sender || (body.data ? body.data.sender : null);

  if (incomingMsg && senderNumber) {
      global.incomingMessageQueue.push({
          content: incomingMsg,
          sender: senderNumber,
          timestamp: Date.now()
      });
      console.log(`✅ Pesan masuk antrian: ${incomingMsg}`);
  } else {
      console.log("⚠️ Webhook masuk tapi format tidak dikenali sebagai pesan chat.");
  }

  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`🚀 Backend berjalan di port ${port}`);
});