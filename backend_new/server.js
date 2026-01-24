require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenAI } = require("@google/genai");
const { KNOWLEDGE_BASE_DATA } = require('./knowledgeBase');
const { SENDER_CUSTOMER_MAP, DEFAULT_CUSTOMER_ID } = require('./constants');
const { CUSTOMERS: initialCustomers, INITIAL_CUSTOMER_DATA: initialDefaultCustomerData } = require('./customerData'); // Import sebagai initial data
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;
const CUSTOMER_DATA_FILE = path.join(__dirname, 'customerData.json');

// Define known WhatsApp Phone IDs from environment variables, *after* dotenv is loaded.
const TEST_WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const LIVE_WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID_LIVE;

// ==========================================
// LOGGER MIDDLEWARE (CRITICAL FOR DEBUGGING)
// ==========================================
app.use((req, res, next) => {
  console.log(`[TRAFFIC] ${req.method} ${req.url} | From: ${req.ip} | UA: ${req.get('user-agent')}`);
  next();
});

// ==========================================
// KONFIGURASI WHATSAPP CLOUD API
// ==========================================
const VERIFY_TOKEN = "rich-ai-verify-token"; 

app.use(cors());
app.use(bodyParser.json());

// ==========================================
// HELPER: GET WHATSAPP CREDENTIALS FOR SERVER'S DEFAULT ENVIRONMENT (based on NODE_ENV)
// Ini untuk logging awal server dan fallback umum jika tidak ada phone ID spesifik.
// ==========================================
const getWhatsAppCredentialsForEnvironment = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const token = isProduction ? process.env.WHATSAPP_ACCESS_TOKEN_LIVE : process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = isProduction ? process.env.WHATSAPP_PHONE_ID_LIVE : process.env.WHATSAPP_PHONE_ID;
    const envType = isProduction ? 'live (determined by NODE_ENV)' : 'test (determined by NODE_ENV)';

    return { token, phoneId, envType };
};

// ==========================================
// HELPER: GET WHATSAPP ACCESS TOKEN BERDASARKAN PHONE NUMBER ID SPESIFIK
// Ini digunakan untuk webhook dan pengiriman pesan manual jika phoneId diketahui.
// ==========================================
const getAccessTokenForPhoneId = (targetPhoneId) => {
    if (targetPhoneId === LIVE_WA_PHONE_ID) {
        return { token: process.env.WHATSAPP_ACCESS_TOKEN_LIVE, envType: 'live' };
    }
    if (targetPhoneId === TEST_WA_PHONE_ID) {
        return { token: process.env.WHATSAPP_ACCESS_TOKEN, envType: 'test' };
    }
    // Fallback jika phoneId tidak cocok dengan yang dikenal (misalnya, phoneId tidak valid dari frontend)
    console.warn(`⚠️ Unknown WhatsApp Phone ID: ${targetPhoneId}. Falling back to default server credentials (based on NODE_ENV).`);
    return getWhatsAppCredentialsForEnvironment(); 
};


// ==========================================
// IN-MEMORY & FILE-BASED DATABASE FOR CUSTOMER DATA
// ==========================================
let customerStates = []; // Akan diisi dari file

const loadCustomerData = () => {
    if (fs.existsSync(CUSTOMER_DATA_FILE)) {
        const data = fs.readFileSync(CUSTOMER_DATA_FILE, 'utf8');
        try {
            customerStates = JSON.parse(data);
            console.log(`✅ Customer data loaded from ${CUSTOMER_DATA_FILE}`);
        } catch (e) {
            console.error(`❌ Error parsing customer data from ${CUSTOMER_DATA_FILE}:`, e.message);
            customerStates = initialCustomers; // Fallback ke data awal
            saveCustomerData(); // Simpan data awal yang valid
        }
    } else {
        customerStates = initialCustomers;
        saveCustomerData(); // Buat file jika belum ada
        console.log(`📝 Initial customer data created in ${CUSTOMER_DATA_FILE}`);
    }
};

const saveCustomerData = () => {
    try {
        fs.writeFileSync(CUSTOMER_DATA_FILE, JSON.stringify(customerStates, null, 2), 'utf8');
        // console.log(`💾 Customer data saved to ${CUSTOMER_DATA_FILE}`); // Terlalu banyak log jika setiap chat
    } catch (e) {
        console.error(`❌ Error saving customer data to ${CUSTOMER_DATA_FILE}:`, e.message);
    }
};

// Load data saat server dimulai
loadCustomerData();

global.lastWebhookData = {
    receivedAt: null,
    sender: null,
    message: null,
    rawBody: null,
    status: 'Waiting for WhatsApp...'
};

// Log WhatsApp environment saat server start
const { token: initialWaToken, phoneId: initialWaPhoneId, envType: initialEnvType } = getWhatsAppCredentialsForEnvironment();
console.log(`⚙️ WhatsApp Gateway configured to operate in ${initialEnvType} as default.`);
if (!initialWaToken || !initialWaPhoneId) {
  console.warn(`⚠️ WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_ID for ${initialEnvType} environment is NOT set in .env!`);
}
if (!TEST_WA_PHONE_ID) console.warn('⚠️ WHATSAPP_PHONE_ID (for test environment) is not set in .env!');
if (!LIVE_WA_PHONE_ID) console.warn('⚠️ WHATSAPP_PHONE_ID_LIVE (for live environment) is not set in .env!');


// ==========================================
// HELPER: FORMAT MARKDOWN TO WHATSAPP STYLE
// ==========================================
const formatToWhatsApp = (text) => {
    let formatted = text;
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '*$1*'); // Bold
    formatted = formatted.replace(/^#+\s*(.*)$/gm, '*$1*'); // Headings to bold
    return formatted;
};

// ==========================================
// HELPER: CALL GEMINI API (INTERNAL KE BACKEND)
// ==========================================
const callGeminiInternal = async (message, customerData) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API Key for Gemini is missing on the backend!");
        return "Gemini API Key is not configured on the server.";
    }

    const ai = new GoogleGenAI({ apiKey });

    const formatKnowledgeBaseForGemini = (kb) => {
        let kbString = "Berikut adalah basis pengetahuan BPJS Kesehatan:\n";
        kb.kb_entries.forEach(entry => {
            kbString += `\n--- KB ID: ${entry.kb_id} ---\n`;
            kbString += `Kategori: ${entry.category}\n`;
            kbString += `Topik: ${entry.topic}\n`;
            kbString += `Ringkasan: ${entry.content.summary}\n`;
            if (entry.content.detail) {
                kbString += `Detail: ${JSON.stringify(entry.content.detail)}\n`;
            }
            if (entry.content.faq && entry.content.faq.length > 0) {
                kbString += `FAQ:\n`;
                entry.content.faq.forEach(faq => {
                    kbString += `- Pertanyaan: ${faq.question}\n  Jawaban: ${faq.answer}\n`;
                });
            }
        });
        return kbString;
    };

    let systemInstruction = `
      Anda adalah PANDAWA (Pelayanan Administrasi Melalui Whatsapp), asisten virtual resmi BPJS Kesehatan.
      
      =========== STATUS & KONTEKS SAAT INI ===========
      Status No. WA User: TERDAFTAR (di DB SIKAT)
      
      =========== DATA PERSONAL PESERTA ===========
      Profil Peserta: ${JSON.stringify(customerData.peserta_profile, null, 2)}
      Info Tagihan: ${JSON.stringify(customerData.billing_info, null, 2)}
      Riwayat Klaim Terakhir: ${JSON.stringify(customerData.claim_history, null, 2)}
      Riwayat Komitmen Pembayaran: ${JSON.stringify(customerData.payment_commitment_history, null, 2)}
      Segmen Perilaku Peserta: ${JSON.stringify(customerData.behavioral_segment, null, 2)}
      Strategi yang Direkomendasikan: ${JSON.stringify(customerData.strategy, null, 2)}
      Konteks Percakapan: ${JSON.stringify(customerData.conversation_context, null, 2)}

      =========== KNOWLEDGE BASE ===========
      ${formatKnowledgeBaseForGemini(KNOWLEDGE_BASE_DATA)}

      =========== GAYA BICARA & FORMATTING (PENTING) ===========
      1. Gunakan Bahasa Indonesia yang sopan, ramah, dan solutif.
      2. FORMAT PESAN WHATSAPP FRIENDLY:
         - JANGAN gunakan format Markdown Heading (seperti # Judul atau ## Subjudul). WhatsApp tidak mendukung ini.
         - Jika ingin menebalkan poin penting, gunakan bold standar Markdown (**)
         - Gunakan bullet points (• atau -) untuk daftar agar rapi di layar HP sempit.
         - Buat paragraf singkat-singkat.
      
      JANGAN memberikan format JSON atau tag khusus seperti [INVOICE_DATA]. Berikan jawaban dalam bentuk teks percakapan normal.
    `;

    const customSystemMessage = customerData.messages.find(m => m.role === 'system')?.content;
    if (customSystemMessage) {
      systemInstruction += `\n\n=========== INSTRUKSI KHUSUS PESERTA INI ===========\n${customSystemMessage}`;
    }

    const historyForGemini = customerData.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        // Memastikan content adalah string non-kosong yang valid
        const contentText = (typeof msg.content === 'string' && msg.content.trim() !== '') 
                              ? msg.content.trim() 
                              : 'Pesan kosong'; // Mengganti pesan kosong dengan placeholder

        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: contentText }]
        };
      });

    try {
        const chatSession = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.3,
            },
            history: historyForGemini
        });

        const result = await chatSession.sendMessage({ message });
        return result.text;

    } catch (error) {
        console.error("Gemini API Error (internal):", error);
        return "Mohon maaf, terjadi kendala teknis saat memproses permintaan Anda. Silakan coba lagi nanti.";
    }
};

// ==========================================
// HELPER: SEND WHATSAPP MESSAGE (INTERNAL KE BACKEND)
// ==========================================
const sendWhatsAppMessageInternal = async (message, target, token, phoneId, isTemplate = false) => {
    if (!token || !phoneId || !target) {
        console.error("Credentials missing for internal WA send (Token, PhoneID, or Target)");
        return { success: false, error: "Credentials missing" };
    }

    const url = `https://graph.facebook.com/v24.0/${phoneId}/messages`;
    let payload = {};

    if (isTemplate) {
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
        console.log(`[OUTGOING WA] Sending Template '${templateName}' to ${target} via Phone ID: ${phoneId}`);
    } else {
        payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: target,
            type: "text",
            text: { preview_url: false, body: message }
        };
        console.log(`[OUTGOING WA] Sending Text to ${target} via Phone ID: ${phoneId}: ${message}`);
    }

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return { success: true, detail: response.data };

    } catch (error) {
        const waError = error.response ? error.response.data : error.message;
        if (waError && waError.error && waError.error.code === 131030) {
            console.error(`❌ [ERROR #131030] Recipient ${target} is not in Allowed List! Add it to Meta Dashboard > Test Numbers.`);
        } else {
            console.error(`❌ [WA SEND FAILED]`, JSON.stringify(waError, null, 2));
        }
        return { success: false, error: "Failed to send to WhatsApp.", details: waError };
    }
};

// ==========================================
// ROOT HEALTH CHECK
// ==========================================
app.get('/', (req, res) => {
  const { envType } = getWhatsAppCredentialsForEnvironment(); // Menggunakan default server NODE_ENV
  res.json({ 
    status: 'Rich Backend Online 🟢', 
    platform: process.env.RAILWAY_STATIC_URL ? 'Railway' : 'Localhost',
    mode: 'WhatsApp Cloud API',
    whatsapp_default_env: envType, // Tambahkan info environment WA default server
    whatsapp_test_phone_id: TEST_WA_PHONE_ID || 'Not Set',
    whatsapp_live_phone_id: LIVE_WA_PHONE_ID || 'Not Set',
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
        const url = `https://graph.facebook.com/v24.0/${phoneId}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data && response.data.verified_name) {
             res.json({ success: true, data: response.data });
        } else {
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
// 2. API: KIRIM PESAN (OUTGOING) - VIA WHATSAPP (FRONTEND/MANUAL)
// ==========================================
app.post('/api/send-message', async (req, res) => {
    const { message, target, token, phoneId, isTemplate } = req.body;
    // Token and phoneId are explicitly passed from frontend, so use them directly
    const result = await sendWhatsAppMessageInternal(message, target, token, phoneId, isTemplate);
    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// ==========================================
// 3. API: POLLING PESAN (FRONTEND) - TIDAK LAGI MENGGUNAKAN QUEUE
// ==========================================
// Frontend kini hanya akan mengambil semua customer data dari backend
app.get('/api/poll-incoming', (req, res) => {
    // This endpoint is effectively deprecated for real-time messages.
    // Frontend should instead use GET /api/customers to get the latest chat history.
    console.warn("Frontend is still calling /api/poll-incoming. Please switch to GET /api/customers for updated chat history.");
    res.json({ hasNew: false, messages: [] }); // Selalu kirim kosong
});

// ==========================================
// 4. API: MANUAL SIMULATION (DEBUGGING)
// ==========================================
app.post('/api/simulate-webhook', async (req, res) => {
    const body = req.body;
    console.log('🧪 [SIMULATION] Received manual payload');
    const result = await processWebhookAndReply(body, true); // True untuk menandakan simulasi

    if (result.success) {
        res.json({ success: true, result });
    } else {
        res.status(400).json({ success: false, reason: result.reason });
    }
});

// ==========================================
// NEW API: GET ALL CUSTOMERS (untuk Frontend)
// ==========================================
app.get('/api/customers', (req, res) => {
    res.json(customerStates);
});

// ==========================================
// NEW API: GET SINGLE CUSTOMER BY ID (untuk Frontend)
// ==========================================
app.get('/api/customer/:id', (req, res) => {
    const customerId = req.params.id;
    const customer = customerStates.find(c => c.id === customerId);
    if (customer) {
        res.json(customer);
    } else {
        res.status(404).json({ success: false, message: "Customer not found" });
    }
});


// ==========================================
// 5. NEW API: CHAT WITH GEMINI (BACKEND-POWERED) - Dipakai untuk manual dari frontend
// ==========================================
app.post('/api/chat-with-gemini', async (req, res) => {
    const { message, customerData: frontendCustomerData, targetPhone } = req.body; 
    let { whatsappToken, whatsappPhoneId } = req.body; // Ambil dari body jika disediakan

    // Temukan atau buat customerData di backend's persistent store
    let customerIndex = customerStates.findIndex(c => c.id === frontendCustomerData.id);
    let currentCustomerData;

    if (customerIndex === -1) {
        // Jika customer ID tidak ditemukan, gunakan data dari frontend sebagai basis
        // Ini bisa terjadi jika frontend memiliki data baru yang belum disimpan backend
        currentCustomerData = { ...frontendCustomerData };
        customerStates.push(currentCustomerData);
        customerIndex = customerStates.length - 1;
    } else {
        // Jika ditemukan, gabungkan pesan dari frontend ke backend
        currentCustomerData = { ...customerStates[customerIndex] };
        // Pastikan history backend mencakup semua pesan dari frontend (user message yang baru)
        const newMessages = frontendCustomerData.messages.slice(currentCustomerData.messages.length);
        currentCustomerData.messages = [...currentCustomerData.messages, ...newMessages];
        customerStates[customerIndex] = currentCustomerData; // Update di state lokal
    }

    // Panggil Gemini
    const aiResponseText = await callGeminiInternal(message, currentCustomerData);
    const aiMsg = { role: 'assistant', content: aiResponseText };
    currentCustomerData.messages.push(aiMsg);
    customerStates[customerIndex] = currentCustomerData; // Update lagi dengan balasan AI

    saveCustomerData(); // Simpan perubahan ke file persisten

    // Jika ada targetPhone, kirim juga ke WhatsApp
    if (targetPhone) {
        // Prioritaskan token/phoneId dari body (yang diinput frontend)
        // Jika tidak ada dari frontend, fallback ke kredensial default server (NODE_ENV based)
        if (!whatsappToken || !whatsappPhoneId) {
            const { token: envToken, phoneId: envPhoneId } = getWhatsAppCredentialsForEnvironment();
            whatsappToken = envToken;
            whatsappPhoneId = envPhoneId;
            console.warn(`Missing WA token/phoneId from frontend for manual chat. Falling back to server's default (${envPhoneId}).`);
        }

        if (whatsappToken && whatsappPhoneId) {
             const waFormattedText = formatToWhatsApp(aiResponseText);
             sendWhatsAppMessageInternal(waFormattedText, targetPhone, whatsappToken, whatsappPhoneId, false);
        } else {
            console.warn("Missing WhatsApp token/phoneId (from frontend or server env) for auto-reply from manual chat-with-gemini.");
        }
    }

    res.json({ success: true, response: aiResponseText });
});

// ==========================================
// HELPER: PROCESS WEBHOOK PAYLOAD & REPLY (Utama untuk incoming WA)
// ==========================================
const processWebhookAndReply = async (body, isSimulation = false) => {
    // Cek apakah ini event dari WhatsApp
    if (body.object) {
        if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.messages &&
            body.entry[0].changes[0].value.messages[0]
        ) {
            const msgObj = body.entry[0].changes[0].value.messages[0];
            const from = msgObj.from; 
            const msgBody = msgObj.text ? msgObj.text.body : "[Non-text message]";
            const contacts = body.entry[0].changes[0].value.contacts;
            const name = contacts ? contacts[0].profile.name : "Unknown";
            const incomingPhoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id; // Extract the incoming phone ID

            console.log(`📩 [NEW MESSAGE] From: ${from} (${name}) | Msg: ${msgBody} | Via Phone ID: ${incomingPhoneNumberId}`);

            const customerIdForMessage = SENDER_CUSTOMER_MAP[from] || DEFAULT_CUSTOMER_ID;
            console.log(`Associated with customerId: ${customerIdForMessage}`);

            // Simpan data untuk Debug
            global.lastWebhookData = {
                receivedAt: new Date().toLocaleString('id-ID'),
                sender: from,
                message: msgBody,
                rawBody: body,
                customerId: customerIdForMessage,
                incomingPhoneNumberId: incomingPhoneNumberId
            };

            // Dapatkan customerData dari persistent store
            let customerIndex = customerStates.findIndex(c => c.id === customerIdForMessage);
            let customerDataToProcess;

            if (customerIndex === -1) {
                // Jika customer baru, buat entri baru berdasarkan default
                customerDataToProcess = {
                    ...initialDefaultCustomerData,
                    id: customerIdForMessage, // Gunakan ID yang sudah ditentukan atau default
                    peserta_profile: {
                        ...initialDefaultCustomerData.peserta_profile,
                        no_hp_masked: from // Simpan nomor WA pengirim
                    },
                    messages: [] // Mulai dengan pesan kosong
                };
                customerStates.push(customerDataToProcess);
                customerIndex = customerStates.length - 1;
            } else {
                customerDataToProcess = { ...customerStates[customerIndex] };
            }

            // Tambahkan pesan user ke riwayat chat
            const userMsg = { role: 'user', content: msgBody };
            customerDataToProcess.messages.push(userMsg);
            
            // --- Panggil AI dan Balas WhatsApp (Otomatis dari Backend) ---
            const aiResponseText = await callGeminiInternal(msgBody, customerDataToProcess);
            const aiMsg = { role: 'assistant', content: aiResponseText };
            customerDataToProcess.messages.push(aiMsg);

            // Perbarui customerData di state global backend
            customerStates[customerIndex] = customerDataToProcess;
            saveCustomerData(); // Simpan ke file

            // Kirim balasan ke WhatsApp (gunakan token yang sesuai dengan incomingPhoneNumberId)
            const { token: waTokenForReply, envType: envTypeForReply } = getAccessTokenForPhoneId(incomingPhoneNumberId);

            if (waTokenForReply && incomingPhoneNumberId && !isSimulation) { // Jangan kirim ke WA jika simulasi
                const waFormattedText = formatToWhatsApp(aiResponseText);
                await sendWhatsAppMessageInternal(waFormattedText, from, waTokenForReply, incomingPhoneNumberId, false);
            } else if (!waTokenForReply || !incomingPhoneNumberId) {
                console.warn(`WHATSAPP_ACCESS_TOKEN or PHONE_ID for ${envTypeForReply} environment not set/found for auto-reply.`);
            }
            // ------------------------------------------------------------------
            
            return { success: true, type: 'message', data: userMsg, aiResponse: aiMsg };

        } 
        else if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.statuses
        ) {
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
// 6. WEBHOOK (GET) - VERIFIKASI META
// ==========================================
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
// 7. WEBHOOK (POST) - MENERIMA PESAN WA (Trigger Utama)
// ==========================================
app.post('/webhook', async (req, res) => {
  const body = req.body;
  
  // IMMEDIATELY SEND 200 OK TO META TO PREVENT RETRIES
  res.sendStatus(200);
  console.log('🔔 [WEBHOOK EVENT] Payload received, 200 OK sent to Meta.');

  // Process the webhook in the background
  setImmediate(async () => {
      console.log('Processing webhook payload asynchronously...');
      const result = await processWebhookAndReply(body); // Panggil fungsi pemprosesan & balasan
      if (!result.success) {
          console.log(`⚠️ [WEBHOOK PROCESSING WARNING] Reason: ${result.reason}`);
      }
  });
});

app.listen(port, () => {
  console.log(`🚀 Server WhatsApp Gateway berjalan di port ${port}`);
});