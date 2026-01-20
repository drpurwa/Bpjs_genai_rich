require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
// Railway akan otomatis meng-inject process.env.PORT
// Jika di local, fallback ke 3001
const port = process.env.PORT || 3001;

// ==========================================
// KONFIGURASI TELEGRAM BOT API
// ==========================================
const ENV_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 

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

// ==========================================
// ROOT HEALTH CHECK (Penting untuk Railway)
// ==========================================
app.get('/', (req, res) => {
  console.log("Health check ping received");
  res.json({ 
    status: 'Rich Backend Online 🟢', 
    platform: process.env.RAILWAY_STATIC_URL ? 'Railway' : 'Localhost',
    mode: 'Telegram Bot API',
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
// 1. API: VERIFY TOKEN (CHECK BOT STATUS)
// ==========================================
app.post('/api/verify-token', async (req, res) => {
    const { token } = req.body;
    const botToken = token || ENV_BOT_TOKEN;

    if (!botToken) {
        return res.status(400).json({ success: false, error: "Token not provided" });
    }

    try {
        // Panggil getMe untuk cek validitas token
        const response = await axios.get(`https://api.telegram.org/bot${botToken}/getMe`);
        res.json({ success: true, bot: response.data.result });
    } catch (error) {
        console.error("Verify Token Error:", error.message);
        res.status(400).json({ 
            success: false, 
            error: "Token Invalid atau Koneksi ke Telegram Gagal", 
            details: error.response ? error.response.data : error.message 
        });
    }
});

// ==========================================
// 2. API: SETUP WEBHOOK (HELPER)
// ==========================================
app.post('/api/setup-webhook', async (req, res) => {
    const { token, url } = req.body;
    const botToken = token || ENV_BOT_TOKEN;

    if (!botToken) {
        return res.status(400).json({ success: false, error: "Token not provided" });
    }
    if (!url) {
        return res.status(400).json({ success: false, error: "Webhook URL not provided" });
    }

    // Validasi URL: Telegram butuh HTTPS public URL (bukan localhost)
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
        return res.status(400).json({ 
            success: false, 
            error: "Invalid Webhook URL", 
            details: "Telegram tidak bisa mengirim ke localhost. Gunakan URL Railway (https://...)" 
        });
    }

    try {
        const apiUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${url}`;
        const response = await axios.get(apiUrl);
        res.json({ success: true, telegram_response: response.data });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: "Failed to set webhook", 
            details: error.response ? error.response.data : error.message 
        });
    }
});

// ==========================================
// 3. API: KIRIM PESAN (OUTGOING) - VIA TELEGRAM
// ==========================================
app.post('/api/send-message', async (req, res) => {
    let { customerId, message, target, token } = req.body;
    
    const botToken = token || ENV_BOT_TOKEN;

    if (!botToken) {
        return res.status(400).json({ success: false, error: "Telegram Bot Token missing" });
    }
    
    if (!target) {
        return res.status(400).json({ success: false, error: "Target Chat ID missing" });
    }

    console.log(`[OUTGOING TELEGRAM] To: ${target} | Msg: ${message}`);
    
    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const response = await axios.post(url, {
            chat_id: target,
            text: message,
            parse_mode: 'Markdown' 
        });

        res.json({ success: true, detail: response.data });

    } catch (error) {
        const telError = error.response ? error.response.data : error.message;
        console.error(`[TELEGRAM FAILED]`, JSON.stringify(telError, null, 2));
        
        res.status(500).json({ 
            success: false, 
            error: "Gagal kirim ke Telegram (Cek Chat ID / Token).",
            details: telError 
        });
    }
});

// ==========================================
// 4. API: POLLING PESAN (INCOMING QUEUE)
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
// 5. WEBHOOK EVENT (POST) - MENERIMA PESAN TELEGRAM
// ==========================================
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.message && body.message.text) {
      const chatId = body.message.chat.id; // Sender ID
      const messageBody = body.message.text; // Isi pesan
      const msgId = body.message.message_id;
      const senderName = body.message.from.first_name || body.message.from.username;

      console.log(`[INCOMING TELEGRAM] From: ${chatId} (${senderName}) | Msg: ${messageBody}`);
      
      global.lastWebhookData = {
          receivedAt: new Date().toLocaleString('id-ID'),
          sender: chatId.toString(),
          message: messageBody,
          rawBody: body
      };

      global.incomingMessageQueue.push({
          id: msgId,
          content: messageBody,
          sender: chatId.toString(),
          timestamp: Date.now()
      });
      
      res.sendStatus(200);
  } else {
      console.log("Non-text message received from Telegram");
      res.sendStatus(200); 
  }
});

app.listen(port, () => {
  console.log(`🚀 Server Telegram Bot berjalan di port ${port}`);
});