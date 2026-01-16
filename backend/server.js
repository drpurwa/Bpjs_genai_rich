require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// KONFIGURASI WHATSAPP CLOUD API (OFFICIAL)
// ==========================================
// Ambil kredensial ini dari Dashboard Meta Developers
const WA_TOKEN = process.env.WA_ACCESS_TOKEN; // User Access Token / System User Token
const WA_PHONE_ID = process.env.WA_PHONE_NUMBER_ID; // Phone Number ID (Bukan nomor HP biasa)
const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'rich_secret_token'; // Token bebas yg Anda buat utk verifikasi webhook

if (!WA_TOKEN || !WA_PHONE_ID) {
  console.error("WARNING: WA_ACCESS_TOKEN atau WA_PHONE_NUMBER_ID belum diset di .env");
}

app.use(cors());
app.use(bodyParser.json());

// ==========================================
// IN-MEMORY DATABASE
// ==========================================
global.incomingMessageQueue = [];
global.lastWebhookData = {
    receivedAt: null,
    sender: null,
    message: null,
    rawBody: null,
    status: 'Waiting...'
};

const formatPhoneNumber = (number) => {
    if (!number) return null;
    let formatted = number.toString().replace(/\D/g, '');
    // Meta biasanya butuh format tanpa +, tapi kita pastikan bersih
    return formatted;
};

app.get('/', (req, res) => {
  res.json({ 
    status: 'Rich Backend Online', 
    mode: 'Official WhatsApp Cloud API',
    time: new Date().toISOString() 
  });
});

// ==========================================
// API DEBUG
// ==========================================
app.get('/api/debug', (req, res) => {
    res.json(global.lastWebhookData);
});

// ==========================================
// 1. API: KIRIM PESAN (OUTGOING) - VIA META
// ==========================================
app.post('/api/send-message', async (req, res) => {
    let { customerId, message, target } = req.body;
    
    // Format nomor untuk Meta (tanpa +)
    let finalTarget = formatPhoneNumber(target);

    if (!finalTarget) {
        return res.status(400).json({ success: false, error: "Target phone missing" });
    }

    console.log(`[OUTGOING META] To: ${finalTarget} | Msg: ${message}`);
    
    try {
        // PERHATIAN: 
        // 1. Jika lebih dari 24 jam sejak user chat terakhir, pesan teks biasa akan GAGAL.
        // 2. Anda harus menggunakan "Template Message" jika ingin memulai percakapan.
        // 3. Kode di bawah ini adalah untuk mengirim pesan TEKS (Reply dalam sesi 24 jam).
        
        const url = `https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`;
        
        const response = await axios.post(url, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: finalTarget,
            type: "text",
            text: { preview_url: false, body: message }
        }, {
            headers: { 
                'Authorization': `Bearer ${WA_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ success: true, detail: response.data });

    } catch (error) {
        // Tangkap error spesifik Meta
        const metaError = error.response ? error.response.data : error.message;
        console.error(`[META FAILED]`, JSON.stringify(metaError, null, 2));
        
        res.status(500).json({ 
            success: false, 
            error: "Gagal kirim ke Meta. Pastikan sesi 24 jam aktif atau gunakan Template.",
            details: metaError 
        });
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
// 3. WEBHOOK VERIFICATION (GET) - WAJIB DI META
// ==========================================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Cek apakah mode dan token cocok
  if (mode && token) {
    if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge); // Wajib mengembalikan challenge
    } else {
      res.sendStatus(403);
    }
  } else {
    // Jika akses biasa tanpa query param
    res.json({ message: "This is Meta Webhook Endpoint. Please configure in Meta Dashboard." });
  }
});

// ==========================================
// 4. WEBHOOK EVENT (POST) - MENERIMA PESAN
// ==========================================
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Cek apakah ini event dari WhatsApp
  if (body.object) {
    if (
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const messageObj = body.entry[0].changes[0].value.messages[0];
      const phoneNumber = messageObj.from; // Nomor pengirim
      const messageBody = messageObj.text ? messageObj.text.body : null; // Isi pesan (jika teks)
      const msgId = messageObj.id;

      if (messageBody) {
          console.log(`[INCOMING META] From: ${phoneNumber} | Msg: ${messageBody}`);
          
          global.lastWebhookData = {
              receivedAt: new Date().toLocaleString('id-ID'),
              sender: phoneNumber,
              message: messageBody,
              rawBody: body
          };

          global.incomingMessageQueue.push({
              id: msgId,
              content: messageBody,
              sender: phoneNumber,
              timestamp: Date.now()
          });
      }
    } else {
       // Event lain (status update, sent, delivered, read) - abaikan untuk sekarang
       // console.log("Webhook received but not a text message");
    }
    
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Support legacy endpoint (redirect or handle same logic if needed)
app.post('/whatsapp', (req, res) => {
    res.status(404).send("Please use /webhook for Official API");
});

app.listen(port, () => {
  console.log(`🚀 Server Official WA berjalan di port ${port}`);
});