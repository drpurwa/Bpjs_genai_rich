require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3001;

// ==========================================
// LOGGER MIDDLEWARE (CRITICAL FOR DEBUGGING)
// ==========================================
// Ini akan mencatat SETIAP request yang masuk, apapun path-nya.
// Jika log ini tidak muncul saat Anda kirim WA, berarti Meta memblokir pesan sebelum sampai sini.
app.use((req, res, next) => {
  console.log(`[TRAFFIC] ${req.method} ${req.url} | From: ${req.ip} | UA: ${req.get('user-agent')}`);
  next();
});

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
// HELPER: PROCESS WEBHOOK LOGIC
// ==========================================
const processWebhookPayload = (body) => {
    // Cek apakah ini event dari WhatsApp
    if (body.object) {
        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            // === INI ADALAH PESAN TEKS DARI USER ===
            const msgObj = body.entry[0].changes[0].value.messages[0];
            const from = msgObj.from; 
            const msgBody = msgObj.text ? msgObj.text.body : "[Non-text message]";
            const msgId = msgObj.id;
            const contacts = body.entry[0].changes[0].value.contacts;
            const name = contacts ? contacts[0].profile.name : "Unknown";

            console.log(`📩 [NEW MESSAGE] From: ${from} (${name}) | Msg: ${msgBody}`);

            // Simpan data untuk Debug
            global.lastWebhookData = {
                receivedAt: new Date().toLocaleString('id-ID'),
                sender: from,
                message: msgBody,
                rawBody: body
            };

            // Masukkan ke Queue untuk dipoll oleh Frontend
            const newMessage = {
                id: msgId,
                content: msgBody,
                sender: from,
                timestamp: Date.now()
            };
            global.incomingMessageQueue.push(newMessage);
            
            return { success: true, type: 'message', data: newMessage };
        } 
        else if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.statuses
        ) {
            // === INI ADALAH STATUS UPDATE (SENT/DELIVERED/READ) ===
            const status = body.entry[0].changes[0].value.statuses[0];
            console.log(`📣 [MSG STATUS] Status update for ${status.recipient_id}: ${status.status}`);
            return { success: true, type: 'status', data: status };
        } 
        else {
            return { success: false, reason: 'Unknown event type (not message/status)' };
        }
    }
    return { success: false, reason: 'Invalid payload object' };
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
    tips: 'Jika webhook tidak masuk, pastikan nomor pengirim sudah ditambahkan di "Test Numbers" Meta Dashboard.',
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

    // Payload Template
    if (isTemplate) {
        // Gunakan nilai 'message' sebagai nama template, atau fallback ke 'hello_world'
        const templateName = message || "hello_world";
        payload = {
            messaging_product: "whatsapp",
            to: target,
            type: "template",
            template: {
                name: templateName, 
                language: { code: "en_US" }
            }
        };
        console.log(`[OUTGOING WA] Sending Template '${templateName}' to ${target}`);
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
        
        // Cek Error Spesifik #131030 (Nomor belum terdaftar di test list)
        if (waError && waError.error && waError.error.code === 131030) {
            console.error(`❌ [ERROR #131030] Recipient ${target} is not in Allowed List! Add it to Meta Dashboard > Test Numbers.`);
        } else {
            console.error(`❌ [WA SEND FAILED]`, JSON.stringify(waError, null, 2));
        }
        
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
// 4. API: MANUAL SIMULATION (DEBUGGING)
// ==========================================
app.post('/api/simulate-webhook', (req, res) => {
    const body = req.body;
    console.log('🧪 [SIMULATION] Received manual payload');
    const result = processWebhookPayload(body);
    
    if (result.success) {
        res.json({ success: true, result });
    } else {
        res.status(400).json({ success: false, reason: result.reason });
    }
});

// ==========================================
// 5. WEBHOOK (GET) - VERIFIKASI META
// ==========================================
// Meta akan memanggil ini saat Anda memasukkan Callback URL di Dashboard
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.log('❌ WEBHOOK VERIFICATION FAILED. Token mismatch.');
      console.log(`Expected: ${VERIFY_TOKEN}, Received: ${token}`);
      res.sendStatus(403);
    }
  } else {
      res.sendStatus(400);
  }
});

// ==========================================
// 6. WEBHOOK (POST) - MENERIMA PESAN WA
// ==========================================
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Log RAW BODY untuk debugging (sangat penting untuk melihat struktur pesan asli)
  console.log('🔔 [WEBHOOK EVENT] Payload:', JSON.stringify(body || {}, null, 2));

  const result = processWebhookPayload(body);

  if (result.success) {
      res.sendStatus(200);
  } else {
      // Walaupun struktur salah, kita tetap return 200 ke Meta agar tidak diretry terus menerus
      // Tapi kita log errornya
      console.log(`⚠️ [WEBHOOK IGNORED] Reason: ${result.reason}`);
      res.sendStatus(200); 
  }
});

app.listen(port, () => {
  console.log(`🚀 Server WhatsApp Gateway berjalan di port ${port}`);
});