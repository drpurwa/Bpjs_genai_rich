require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// ==========================================
// KONFIGURASI WHATSAPP CLOUD API
// ==========================================
// Token Verifikasi Webhook (Anda buat sendiri, masukkan ini di Dashboard Meta)
const VERIFY_TOKEN = "rich-ai-verify-token"; 

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
    status: 'Waiting for WhatsApp...'
};

// ==========================================
// ROOT HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  res.json({ 
    status: 'Rich Backend Online 🟢', 
    platform: process.env.RAILWAY_STATIC_URL ? 'Railway' : 'Localhost',
    mode: 'WhatsApp Cloud API',
    port: port,
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
// 1. API: VERIFY CREDENTIALS (CHECK TOKEN)
// ==========================================
app.post('/api/verify-token', async (req, res) => {
    let { token, phoneId } = req.body;

    if (!token || !phoneId) {
        return res.status(400).json({ success: false, error: "Token or Phone ID missing" });
    }

    try {
        // Cek validitas dengan mengambil info nomor telepon
        const url = `https://graph.facebook.com/v22.0/${phoneId}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data && response.data.verified_name) {
             res.json({ success: true, data: response.data });
        } else {
             // Kadang return sukses tapi field beda, anggap sukses jika 200 OK
             res.json({ success: true, data: response.data });
        }
    } catch (error) {
        console.error("Verify WA Token Error:", error.message);
        const errorData = error.response ? error.response.data : error.message;
        
        res.status(400).json({ 
            success: false, 
            error: "Gagal verifikasi Token/Phone ID.", 
            details: errorData 
        });
    }
});

// ==========================================
// 2. API: KIRIM PESAN (OUTGOING) - VIA WHATSAPP
// ==========================================
app.post('/api/send-message', async (req, res) => {
    let { message, target, token, phoneId, isTemplate } = req.body;

    if (!token || !phoneId || !target) {
        return res.status(400).json({ success: false, error: "Credentials missing (Token, PhoneID, or Target)" });
    }

    // Graph API URL
    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;

    // Payload Default (Text)
    let payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: target,
        type: "text",
        text: { preview_url: false, body: message }
    };

    // Payload Template (Jika diminta, misal untuk pesan pertama)
    // Menggunakan template 'hello_world' yang default ada di semua akun sandbox/live Meta
    if (isTemplate) {
        payload = {
            messaging_product: "whatsapp",
            to: target,
            type: "template",
            template: {
                name: "hello_world", // Template default Meta
                language: { code: "en_US" }
            }
        };
        console.log(`[OUTGOING WA] Sending Template hello_world to ${target}`);
    } else {
        console.log(`[OUTGOING WA] Sending Text to ${target}: ${message}`);
    }

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        res.json({ success: true, detail: response.data });

    } catch (error) {
        const waError = error.response ? error.response.data : error.message;
        console.error(`[WA SEND FAILED]`, JSON.stringify(waError, null, 2));
        
        res.status(500).json({ 
            success: false, 
            error: "Gagal kirim ke WhatsApp.",
            details: waError 
        });
    }
});

// ==========================================
// 3. API: POLLING PESAN (INCOMING QUEUE)
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
// 4. WEBHOOK (GET) - VERIFIKASI META
// ==========================================
// Meta akan memanggil ini saat Anda memasukkan Callback URL di Dashboard
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
      res.sendStatus(400);
  }
});

// ==========================================
// 5. WEBHOOK (POST) - MENERIMA PESAN WA
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
      const msgObj = body.entry[0].changes[0].value.messages[0];
      const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
      const from = msgObj.from; 
      const msgBody = msgObj.text ? msgObj.text.body : "[Non-text message]";
      const msgId = msgObj.id;
      const name = body.entry[0].changes[0].value.contacts[0].profile.name;

      console.log(`[INCOMING WA] From: ${from} (${name}) | Msg: ${msgBody}`);

      // Simpan data untuk Debug
      global.lastWebhookData = {
          receivedAt: new Date().toLocaleString('id-ID'),
          sender: from,
          message: msgBody,
          rawBody: body
      };

      // Masukkan ke Queue untuk dipoll oleh Frontend
      global.incomingMessageQueue.push({
          id: msgId,
          content: msgBody,
          sender: from,
          timestamp: Date.now()
      });
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(port, () => {
  console.log(`🚀 Server WhatsApp Gateway berjalan di port ${port}`);
});