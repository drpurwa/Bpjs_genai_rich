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
// Default target dari env (jika frontend tidak mengirim)
const DEFAULT_TARGET_PHONE = process.env.TARGET_PHONE_NUMBER;

if (!FONNTE_TOKEN) {
  console.error("ERROR: Harap lengkapi file .env dengan FONNTE_TOKEN");
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// IN-MEMORY DATABASE (Message Queue)
// ==========================================
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

// Helper Format Nomor HP
const formatPhoneNumber = (number) => {
    if (!number) return null;
    let formatted = number.toString().replace(/\D/g, ''); // Hapus non-digit
    if (formatted.startsWith('08')) {
        formatted = '62' + formatted.slice(1);
    }
    return formatted;
};

app.get('/', (req, res) => {
  res.send('RICH Backend (Dynamic Target) is running! 🚀');
});

// ==========================================
// 1. API: KIRIM PESAN (OUTGOING)
// ==========================================
app.post('/api/send-message', async (req, res) => {
    // Terima target dari Frontend, fallback ke ENV jika kosong
    let { customerId, message, target } = req.body;
    
    // Logika prioritas target: Request Body > Environment Variable
    let finalTarget = target ? formatPhoneNumber(target) : formatPhoneNumber(DEFAULT_TARGET_PHONE);

    if (!finalTarget) {
        return res.status(400).json({ success: false, error: "Target phone number is missing (check Frontend input or .env)" });
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

        console.log(`[FONNTE SUCCESS] Status: ${response.data.status}`);
        saveMessage(customerId, 'assistant', message);
        res.json({ success: true, detail: response.data, target_used: finalTarget });

    } catch (error) {
        console.error(`[FONNTE FAILED]`, error.response ? error.response.data : error.message);
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

  console.log(`[INCOMING] Dari ${senderNumber}: ${incomingMsg}`);

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
  console.log(`🚀 Backend (Dynamic Target) berjalan di port ${port}`);
});