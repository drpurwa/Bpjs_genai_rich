require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// KONFIGURASI TELEGRAM BOT API
// ==========================================
// Ambil token dari @BotFather
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; 

if (!TELEGRAM_BOT_TOKEN) {
  console.error("WARNING: TELEGRAM_BOT_TOKEN belum diset di .env");
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

app.get('/', (req, res) => {
  res.json({ 
    status: 'Rich Backend Online', 
    mode: 'Telegram Bot API',
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
// 1. API: KIRIM PESAN (OUTGOING) - VIA TELEGRAM
// ==========================================
app.post('/api/send-message', async (req, res) => {
    let { customerId, message, target } = req.body;
    
    // Target di Telegram adalah Chat ID (bisa angka positif/negatif)
    if (!target) {
        return res.status(400).json({ success: false, error: "Target Chat ID missing" });
    }

    console.log(`[OUTGOING TELEGRAM] To: ${target} | Msg: ${message}`);
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await axios.post(url, {
            chat_id: target,
            text: message,
            parse_mode: 'Markdown' // Optional: agar support bold/italic
        });

        res.json({ success: true, detail: response.data });

    } catch (error) {
        const telError = error.response ? error.response.data : error.message;
        console.error(`[TELEGRAM FAILED]`, JSON.stringify(telError, null, 2));
        
        res.status(500).json({ 
            success: false, 
            error: "Gagal kirim ke Telegram.",
            details: telError 
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
// 3. WEBHOOK EVENT (POST) - MENERIMA PESAN TELEGRAM
// ==========================================
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Cek struktur Update Object dari Telegram
  // Docs: https://core.telegram.org/bots/api#update
  if (body.message && body.message.text) {
      const chatId = body.message.chat.id; // Sender ID
      const messageBody = body.message.text; // Isi pesan
      const msgId = body.message.message_id;
      const senderName = body.message.from.first_name || body.message.from.username;

      console.log(`[INCOMING TELEGRAM] From: ${chatId} (${senderName}) | Msg: ${messageBody}`);
      
      global.lastWebhookData = {
          receivedAt: new Date().toLocaleString('id-ID'),
          sender: chatId.toString(), // Convert to string for consistency
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
      // Event lain (edit message, channel post, dll) - abaikan atau log
      console.log("Non-text message received from Telegram");
      res.sendStatus(200); // Tetap return 200 agar Telegram tidak retry terus menerus
  }
});

app.listen(port, () => {
  console.log(`🚀 Server Telegram Bot berjalan di port ${port}`);
});