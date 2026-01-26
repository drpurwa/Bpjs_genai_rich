require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { GoogleGenAI } = require("@google/genai");
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const { KNOWLEDGE_BASE_DATA } = require('./knowledgeBase');
// const fs = require('fs'); // Tidak lagi digunakan untuk data pelanggan
// const path = require('path'); // Tidak lagi digunakan untuk data pelanggan

const app = express();
const port = process.env.PORT || 3001;
// const CUSTOMER_DATA_FILE = path.join(__dirname, 'customerData.json'); // Tidak lagi digunakan

// Define known WhatsApp Phone IDs from environment variables, *after* dotenv is loaded.
const TEST_WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const LIVE_WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID_LIVE;

// ==========================================
// INISIALISASI FIREBASE
// ==========================================
// Pastikan semua variabel lingkungan Firebase tersedia
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("❌ FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY is NOT set in .env! Firestore will not function.");
} else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newline characters if in single line env var
            })
        });
        console.log("✅ Firebase Admin SDK initialized successfully.");
    } catch (error) {
        console.error("❌ Failed to initialize Firebase Admin SDK:", error.message);
    }
}

const db = admin.firestore();
const customersCollection = db.collection('customers');
const appSettingsCollection = db.collection('app_settings'); // New collection for app-wide settings


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
// INITIAL SEED DATA (from previous constants.js and customerData.js)
// ==========================================

// Initial SENDER_CUSTOMER_MAP (for seeding Firestore)
const INITIAL_SENDER_CUSTOMER_MAP = {
    '6282111164113': 'CONV_20250510_000023',
    '628122123232': 'CONV_20250510_000102',
    '628123810892': 'ACTIVE_ENGAGE_000111',
    '6285216669394': 'CONV_20250510_000023'
};

// Initial DEFAULT_CUSTOMER_ID (for seeding Firestore)
const INITIAL_DEFAULT_CUSTOMER_ID = 'CONV_20250510_000023';

// Initial Customer Data (for seeding Firestore)
const CUSTOMER_1 = {
  "id": "CONV_20250510_000023",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX000023",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "3",
    "pekerjaan": "Wiraswasta",
    "jumlah_tanggungan": 2,
    "usia": 27,
    "gender": "P",
  },
  "billing_info": {
    "total_tunggakan": 70000,
    "bulan_menunggak": ["JANUARI 2025"],
    "durasi_bulan": 1,
    "last_payment_date": "2024-12-15",
    "last_payment_method": "M-Banking BCA"
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "Ahmad F*** P****",
      "date": "2025-05-10",
      "channel": "Telepon",
      "outcome": "Janji Bayar",
      "alasan_tunggak": "Lupa membayar"
    }
  },
  "payment_commitment_history": {
    "credibility_score": 0.33,
    "last_promise": {
      "promised_date": "2025-05-10",
      "status": "broken_promise",
      "days_overdue": 2
    },
    "promises": [] // Ensure promises array is present
  },
  "claim_history": {
    "last_claim": {
      "date": "2024-08-10",
      "type": "Rawat Inap",
      "diagnosis": "DBD",
      "hospital": "RS Sardjito",
      "claim_amount": 8500000
    }
  },
  "strategy": {
    "approach": "Gentle Reminder + Claim Data Trigger",
    "urgency": "Medium (sudah 2 hari dari janji)",
    "tone": "Empathic but Firm"
  },
  "messages": [
    {
      "role": "assistant",
      "content": "Selamat siang Ibu C****** 🌤️ (Kartu akhiran **0023**)\n\nMenyambung pembicaraan dengan Petugas Telecollecting kami Ahmad Ferdi tanggal 10 Mei kemarin, kami ingin mengingatkan kembali untuk iuran JKN bulan Januari sebesar **Rp70.000**.\n\nKami paham Ibu sibuk dengan pekerjaan, tapi agar kepesertaan keluarga (2 jiwa) tetap aman, yuk diselesaikan hari ini. 😊"
    }
  ]
};

const CUSTOMER_2 = {
  "id": "CONV_20250511_000001",
  "dataset_type": "telecollecting_conversation",
  "timestamp_created": "2025-05-11T10:00:00Z",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX100001",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "3",
    "jumlah_tanggungan": 1,
    "usia": 31,
    "gender": "L",
    "no_hp_masked": "0857****9901",
    "flag_rehab_eligible": false,
    "flag_autodebit": false
  },
  "billing_info": {
    "total_tunggakan": 105000,
    "bulan_menunggak": ["JANUARI 2025", "FEBRUARI 2025", "MARET 2025"],
    "durasi_bulan": 3,
    "iuran_per_bulan": 35000,
    "iuran_per_jiwa": 35000,
    "tanggal_jatuh_tempo": 10,
    "last_payment_date": "2024-12-10",
    "last_payment_amount": 35000,
    "last_payment_method": "ShopeePay",
    "payment_frequency_6months": 4,
    "avg_delay_days": 4
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "Dewi Paramitha",
      "date": "2025-05-10",
      "time": "15:00:00",
      "channel": "WhatsApp",
      "outcome": "Janji Bayar",
      "respon": "Peserta Komitmen bayar",
      "alasan_tunggak": "Lupa membayar",
      "notes": "Peserta bilang akan bayar tanggal 11 Mei"
    },
    "total_call_attempts": 1,
    "total_successful_contacts": 1,
    "first_contact_date": "2025-05-10",
    "contact_history": [
      {
        "date": "2025-05-10",
        "channel": "WhatsApp",
        "outcome": "Janji Bayar",
        "agent": "Dewi Paramitha"
      }
    ]
  },
  "payment_commitment_history": {
    "total_promises": 2,
    "fulfilled_promises": 1,
    "broken_promises": 1,
    "credibility_score": 0.5,
    "promises": [
      {
        "promised_date": "2025-05-10",
        "promised_amount": 105000,
        "actual_payment_date": null,
        "status": "broken_promise",
        "days_overdue": 1
      },
      {
        "promised_date": "2025-02-10",
        "promised_amount": 35000,
        "actual_payment_date": "2025-02-11",
        "status": "delayed",
        "days_overdue": 1
      }
    ],
    "last_promise": {
      "promised_date": "2025-05-10",
      "status": "broken_promise",
      "days_overdue": 1
    }
  },
  "claim_history": {
    "total_claims_lifetime": 1,
    "total_amount_claimed": 2500000,
    "total_iuran_paid_lifetime": 1260000,
    "roi_ratio": 1.98,
    "last_claim": {
      "date": "2024-09-20",
      "type": "Rawat Jalan",
      "diagnosis": "ISPA",
      "hospital": "RSUD Sleman",
      "claim_amount": 450000,
      "out_of_pocket": 0,
      "los_days": 0
    },
    "claim_summary_1year": {
      "total_claims": 1,
      "total_amount": 450000,
      "most_frequent_type": "Rawat Jalan"
    }
  },
  "behavioral_segment": {
    "persona": "Forgetful Payer",
    "pain_points": ["Sering lupa tanggal jatuh tempo"],
    "motivators": ["Anak 1", "Ingin aman"],
    "objection_patterns": ["Nanti saya cek"],
    "communication_style": "Responsif",
    "payment_behavior": "Sering telat 1–4 hari"
  },
  "strategy": {
    "approach": "Soft Reminder",
    "urgency": "Medium",
    "tone": "Friendly",
    "primary_goal": "Immediate Payment",
    "secondary_goal": "Autodebet Registration",
    "recommended_actions": [
      {
        "action": "Send WhatsApp Reminder",
        "timing": "09:00-11:00",
        "priority": 1,
        "script_template": "soft_reminder_1month"
      },
      {
        "action": "Offer Autodebet Registration",
        "timing": "Post-payment",
        "priority": 2,
        "script_template": "autodebet_pitch"
      }
    ]
  },
  "conversation_context": {
    "is_first_contact": false,
    "has_previous_conversation": true,
    "last_conversation_summary": "Peserta lupa bayar dan janji bayar 11 Mei",
    "current_conversation_goal": "Follow-up",
    "sentiment_last_interaction": "Positive"
  },
  "messages": [
    {
      "role": "system",
      "content": "Anda adalah PANDAWA. Peserta ini termasuk persona Forgetful Payer, sering lupa bayar namun responsif. Ia punya riwayat 1 broken promise (credibility score 0.5) dan pernah janji bayar tanggal 11 Mei namun belum lunas. Gunakan pendekatan soft reminder, friendly, dan fokus ke penyelesaian hari ini. Dorong autodebit setelah pembayaran."
    },
    {
      "role": "assistant",
      "content": "Selamat pagi Bapak A*****👋 (Akhiran kartu **0001**)\n\nMenyambung pesan dari Petugas kami *Ibu Dewi* tanggal **10 Mei** kemarin, Bapak menyampaikan akan melakukan pembayaran tanggal **11 Mei**. Hari ini kami ingatkan kembali iuran JKN yang tertunggak **3 bulan (Jan–Mar 2025)** dengan total **Rp105.000**.\n\nMenghindari lupa seperti sebelumnya, bagaimana kalau kita selesaikan sekarang saja Pak? 😊"
    }
  ]
};

const CUSTOMER_3 = {
  "id": "CONV_20250511_000101",
  "dataset_type": "telecollecting_conversation",
  "timestamp_created": "2025-05-11T08:15:00Z",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX000101",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "1",
    "jumlah_tanggungan": 3,
    "usia": 45,
    "gender": "L",
    "no_hp_masked": "0811****9988",
    "flag_rehab_eligible": false,
    "flag_autodebit": true
  },
  "billing_info": {
    "total_tunggakan": 450000,
    "bulan_menunggak": ["APRIL 2025"],
    "durasi_bulan": 1,
    "iuran_per_bulan": 450000,
    "iuran_per_jiwa": 150000,
    "tanggal_jatuh_tempo": 10,
    "last_payment_date": "2025-03-10",
    "last_payment_amount": 450000,
    "last_payment_method": "Autodebet BNI",
    "payment_frequency_6months": 6,
    "avg_delay_days": 0
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "System Auto",
      "date": "2025-05-11",
      "time": "09:00:00",
      "channel": "WhatsApp",
      "outcome": "Gagal Autodebet",
      "respon": "Saldo tidak cukup",
      "alasan_tunggak": "Saldo Kurang",
      "notes": "Notifikasi gagal debet terkirim"
    },
    "total_call_attempts": 0,
    "total_successful_contacts": 0,
    "first_contact_date": undefined,
    "contact_history": []
  },
  "payment_commitment_history": {
    "total_promises": 0,
    "fulfilled_promises": 0,
    "broken_promises": 0,
    "credibility_score": 1.0,
    "promises": []
  },
  "claim_history": {
    "total_claims_lifetime": 5,
    "total_amount_claimed": 25000000,
    "total_iuran_paid_lifetime": 10800000,
    "roi_ratio": 2.31,
    "last_claim": {
      "date": "2024-11-20",
      "type": "Rawat Jalan",
      "diagnosis": "Jantung Koroner",
      "hospital": "RS Harapan Kita",
      "claim_amount": 1500000,
      "out_of_pocket": 100000,
      "los_days": 0
    },
    "claim_summary_1year": {
      "total_claims": 3,
      "total_amount": 4500000,
      "most_frequent_type": "Rawat Jalan"
    }
  },
  "behavioral_segment": {
    "persona": "Reliable Payer",
    "pain_points": ["Lupa top up saldo"],
    "motivators": ["Kesehatan Jantung", "Kenyamanan"],
    "objection_patterns": [],
    "communication_style": "Formal dan Singkat",
    "payment_behavior": "Selalu tepat waktu via autodebet"
  },
  "strategy": {
    "approach": "Notification Only",
    "urgency": "Low",
    "tone": "Informative",
    "primary_goal": "Top Up Reminder",
    "secondary_goal": "Maintain Habit",
    "recommended_actions": [
      {
        "action": "Send WA Reminder",
        "timing": "Immediate",
        "priority": 1,
        "script_template": "autodebet_failed_reminder"
      }
    ]
  },
  "conversation_context": {
    "is_first_contact": true,
    "has_previous_conversation": false,
    "last_conversation_summary": "N/A",
    "current_conversation_goal": "Inform Failed Autodebet",
    "sentiment_last_interaction": "Neutral"
  },
  "messages": [
    {
      "role": "system",
      "content": "Anda adalah PANDAWA. Peserta ini 'Reliable Payer' (selalu lunas via autodebet), namun bulan ini gagal debet. Gunakan KB AUTO_002 untuk menjelaskan penyebab (kemungkinan saldo kurang saat tanggal 5/20) dan arahkan ke KB PAY_001 (Bayar Manual) agar kartu aktif kembali segera."
    },
    {
      "role": "assistant",
      "content": "Selamat pagi Bapak F******, dengan PANDAWA BPJS Kesehatan. 🙏\n\nKami menginformasikan bahwa pendebetan iuran autodebet BNI Bapak bulan ini **gagal terproses** untuk tagihan **Rp450.000**. Biasanya, hal ini terjadi jika saldo tidak mencukupi pada tanggal penarikan otomatis (tanggal 5 atau 20).\n\nApakah Bapak berkenan kami pandu untuk pembayaran manual kali ini agar status kepesertaan Bapak tetap aktif?"
    }
  ]
};

const CUSTOMER_4 = {
  "id": "CONV_20250510_000102",
  "dataset_type": "telecollecting_conversation",
  "timestamp_created": "2025-05-10T10:00:00Z",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX000102",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "3",
    "jumlah_tanggungan": 4,
    "usia": 35,
    "gender": "P",
    "no_hp_masked": "0857****1234",
    "flag_rehab_eligible": true,
    "flag_autodebit": false
  },
  "billing_info": {
    "total_tunggakan": 840000,
    "bulan_menunggak": ["DES 2024", "JAN 2025", "FEB 2025", "MAR 2025", "APR 2025", "MEI 2025"],
    "durasi_bulan": 6,
    "iuran_per_bulan": 140000,
    "iuran_per_jiwa": 35000,
    "tanggal_jatuh_tempo": 10,
    "last_payment_date": "2024-11-15",
    "last_payment_amount": 140000,
    "last_payment_method": "Alfamart",
    "payment_frequency_6months": 0,
    "avg_delay_days": 20
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "Siti Aminah",
      "date": "2025-05-08",
      "time": "10:15:00",
      "channel": "Telepon",
      "outcome": "Janji Bayar",
      "respon": "Minta ikut program cicilan",
      "alasan_tunggak": "Tidak Mampu (PHK)",
      "notes": "Suami baru kena PHK, tertarik program REHAB"
    },
    "total_call_attempts": 5,
    "total_successful_contacts": 2,
    "first_contact_date": "2025-02-10",
    "contact_history": [
      { "date": "2025-05-08", "channel": "Telepon", "outcome": "Janji Bayar", "agent": "Siti Aminah" },
      { "date": "2025-03-15", "channel": "WhatsApp", "outcome": "Dibaca", "agent": "System Auto" }
    ]
  },
  "payment_commitment_history": {
    "total_promises": 1,
    "fulfilled_promises": 0,
    "broken_promises": 0,
    "credibility_score": 0.5,
    "promises": [
      {
        "promised_date": "2025-05-15",
        "promised_amount": 280000,
        "actual_payment_date": null,
        "status": "pending",
        "days_overdue": 0
      }
    ]
  },
  "claim_history": {
    "total_claims_lifetime": 1,
    "total_amount_claimed": 5000000,
    "total_iuran_paid_lifetime": 3360000,
    "roi_ratio": 1.48,
    "last_claim": {
      "date": "2023-06-10",
      "type": "Rawat Inap",
      "diagnosis": "Persalinan SC",
      "hospital": "RSUD Cibinong",
      "claim_amount": 5000000,
      "out_of_pocket": 0,
      "los_days": 3
    },
    "claim_summary_1year": {
      "total_claims": 0,
      "total_amount": 0,
      "most_frequent_type": "N/A"
    }
  },
  "behavioral_segment": {
    "persona": "Financial Struggle",
    "pain_points": ["Cashflow tidak menentu", "Takut denda"],
    "motivators": ["Anak balita", "Bantuan Cicilan"],
    "objection_patterns": ["Belum ada uang", "Tunggu gajian harian"],
    "communication_style": "Butuh empati tinggi",
    "payment_behavior": "Bayar manual di gerai retail"
  },
  "strategy": {
    "approach": "Consultative Selling (REHAB)",
    "urgency": "High",
    "tone": "Empathetic, Supportive",
    "primary_goal": "REHAB Registration",
    "secondary_goal": "Partial Payment",
    "recommended_actions": [
      {
        "action": "Guide REHAB Registration via Mobile JKN",
        "timing": "Next Call",
        "priority": 1,
        "script_template": "rehab_program_guide"
      }
    ]
  },
  "conversation_context": {
    "is_first_contact": false,
    "has_previous_conversation": true,
    "last_conversation_summary": "Peserta ingin mencicil tunggakan karena kesulitan ekonomi",
    "current_conversation_goal": "Closing REHAB Registration",
    "sentiment_last_interaction": "Positive (Relieved)"
  },
  "messages": [
    {
      "role": "system",
      "content": "Peserta mengalami kesulitan ekonomi (PHK) dan memiliki tunggakan 6 bulan. Peserta meminta keringanan. Wajib tawarkan solusi menggunakan KB REHAB_001. Edukasi cara daftar di Mobile JKN."
    },
    {
      "role": "assistant",
      "content": "Selamat siang Ibu S****. Kami memahami kondisi Ibu sekeluarga pasca musibah PHK yang dialami. Berdasarkan data, total tunggakan saat ini **Rp840.000 (6 bulan)**.\n\nKarena tunggakan Ibu sudah lebih dari 3 bulan, Ibu **BERHAK** mengikuti **Program REHAB (Cicilan)**. Dengan program ini, Ibu tidak perlu bayar lunas sekaligus, tapi bisa dicicil hingga 12 bulan. Apakah Ibu berminat kami pandu simulasinya?"
    }
  ]
};

const CUSTOMER_5 = {
  "id": "ACTIVE_ENGAGE_000111",
  "dataset_type": "telecollecting_conversation",
  "timestamp_created": "2025-05-20T09:00:00Z",
  "peserta_profile": {
    "nokapst_masked": "XXXXXXXX000111",
    "status_kepesertaan": "PBPU",
    "kelas_rawat": "2",
    "jumlah_tanggungan": 3,
    "usia": 34,
    "gender": "L",
    "no_hp_masked": "0813****2211",
    "flag_rehab_eligible": false,
    "flag_autodebit": false,
    "flag_mobile_jkn": false
  },
  "billing_info": {
    "total_tunggakan": 0,
    "bulan_menunggak": [],
    "durasi_bulan": 0,
    "iuran_per_bulan": 150000,
    "iuran_per_jiwa": 50000,
    "tanggal_jatuh_tempo": 10,
    "last_payment_date": "2025-05-05",
    "last_payment_amount": 150000,
    "last_payment_method": "M-Banking BCA",
    "payment_frequency_6months": 6,
    "avg_delay_days": 0
  },
  "interaction_history": {
    "last_contact": {
      "agent_name": "System Auto",
      "date": "2025-04-10",
      "time": "09:00:00",
      "channel": "WhatsApp",
      "outcome": "Informational Broadcast",
      "respon": "Tidak Dibalas",
      "alasan_tunggak": "N/A",
      "notes": "Pesan ucapan terima kasih pembayaran tepat waktu"
    },
    "total_call_attempts": 0,
    "total_successful_contacts": 0,
    "first_contact_date": undefined,
    "contact_history": [
      {
        "date": "2025-04-10",
        "channel": "WhatsApp",
        "outcome": "Informational Broadcast",
        "agent": "System Auto"
      }
    ]
  },
  "payment_commitment_history": {
    "total_promises": 0,
    "fulfilled_promises": 0,
    "broken_promises": 0,
    "credibility_score": 1.0,
    "promises": []
  },
  "claim_history": {
    "total_claims_lifetime": 1,
    "total_amount_claimed": 950000,
    "total_iuran_paid_lifetime": 900000,
    "roi_ratio": 1.06,
    "last_claim": {
      "date": "2024-11-15",
      "type": "Rawat Jalan",
      "diagnosis": "Demam & Infeksi Saluran Pernapasan",
      "hospital": "Klinik Pratama Sehat",
      "claim_amount": 300000,
      "out_of_pocket": 0,
      "los_days": 0
    },
    "claim_summary_1year": {
      "total_claims": 1,
      "total_amount": 300000,
      "most_frequent_type": "Rawat Jalan"
    }
  },
  "behavioral_segment": {
    "persona": "Reliable Payer",
    "pain_points": [
      "Belum tahu fitur-fitur digital JKN",
      "Harus cek manual jika butuh informasi"
    ],
    "motivators": [
      "Ingin kepastian perlindungan keluarga",
      "Suka cara yang praktis dan jelas"
    ],
    "objection_patterns": [
      "Belum sempat install aplikasi",
      "Takut ribet urusan akun"
    ],
    "communication_style": "Kooperatif, menghargai penjelasan ringkas",
    "payment_behavior": "Rutin bayar sebelum jatuh tempo"
  },
  "strategy": {
    "approach": "Engagement_Education",
    "urgency": "None",
    "tone": "Appreciative, Informative",
    "primary_goal": "Edukasi Mobile JKN dan autodebet",
    "secondary_goal": "Menjaga retensi peserta aktif",
    "recommended_actions": [
      {
        "action": "Send WhatsApp Appreciation + MobileJKN Intro",
        "timing": "09:00-11:00",
        "priority": 1,
        "script_template": "engagement_active_no_mobilejkn"
      }
    ],
    "escalation_rule": {
      "if_no_response_by": "2025-05-25",
      "then": "No escalation (engagement only)",
      "if_broken_promise_again": "N/A"
    }
  },
  "conversation_context": {
    "is_first_contact": true,
    "has_previous_conversation": false,
    "last_conversation_summary": "N/A",
    "current_conversation_goal": "Apresiasi & edukasi Mobile JKN",
    "sentiment_last_interaction": "N/A"
  },
  "messages": [
    {
      "role": "system",
      "content": "Anda adalah RICH, asisten virtual JKN dari BPJS Kesehatan.\n\nKonteks: Peserta ini **aktif membayar**, tidak punya tunggakan, dan belum menggunakan Mobile JKN. Tugas Anda adalah melakukan ENGAGEMENT, bukan penagihan.\n\nInstruksi:\n1. Sampaikan apresiasi atas kedisiplinan membayar iuran.\n2. Jelaskan bahwa ada cara lebih mudah untuk memantau iuran & kepesertaan melalui aplikasi Mobile JKN.\n3. Tanyakan dengan sopan apakah peserta sudah pernah menggunakan Mobile JKN.\n4. Jika belum: bantu edukasi manfaat utama dan langkah awal instalasi.\n5. Gunakan bahasa yang ramah, tidak menggurui, dan tidak menakut-nakuti."
    },
    {
      "role": "assistant",
      "content": "Selamat siang, Bapak A**** (kartu JKN akhiran **0111**) 🌿\n\nKami dari BPJS Kesehatan ingin menyampaikan **terima kasih** karena Bapak selalu rutin menjaga iuran JKN tetap aktif. Kebiasaan baik seperti ini sangat membantu melindungi Bapak dan keluarga dari risiko pembiayaan layanan kesehatan yang besar. 🙏"
    },
    {
      "role": "assistant",
      "content": "Untuk ke depannya, Untuk menghindari risiko lupa atau terlewat tanggal, Bapak dapat mengaktifkan fitur Autodebet di Mobile JKN agar pembayaran berjalan otomatis tiap bulan. Apakah Bapak sudah pernah menggunakan aplikasi **Mobile JKN** sebelumnya?"
    }
  ]
};

const INITIAL_CUSTOMERS_SEED = [CUSTOMER_1, CUSTOMER_2, CUSTOMER_3, CUSTOMER_4, CUSTOMER_5];
const INITIAL_DEFAULT_CUSTOMER_DATA = CUSTOMER_1; // Used for new customers if no mapping

// ==========================================
// DATABASE OPERATIONS (Firestore)
// ==========================================
let customerStates = []; // In-memory cache for customer data
global.SENDER_CUSTOMER_MAP = {}; // Global variable to store map loaded from Firestore
global.DEFAULT_CUSTOMER_ID = null; // Global variable to store default ID loaded from Firestore

// Load / Initialize customer data and app settings from Firestore
const initializeCustomerData = async () => {
    try {
        // --- Initialize App Settings ---
        const configDocRef = appSettingsCollection.doc('whatsapp_config');
        const configSnapshot = await configDocRef.get();
        
        if (!configSnapshot.exists) {
            console.log('Firestore app_settings/whatsapp_config document is empty. Seeding with initial config...');
            const initialConfig = {
                senderCustomerMap: INITIAL_SENDER_CUSTOMER_MAP,
                defaultCustomerId: INITIAL_DEFAULT_CUSTOMER_ID
            };
            await configDocRef.set(initialConfig);
            global.SENDER_CUSTOMER_MAP = INITIAL_SENDER_CUSTOMER_MAP;
            global.DEFAULT_CUSTOMER_ID = INITIAL_DEFAULT_CUSTOMER_ID;
            console.log('📝 Initial app config seeded to Firestore.');
        } else {
            const configData = configSnapshot.data();
            global.SENDER_CUSTOMER_MAP = configData.senderCustomerMap || INITIAL_SENDER_CUSTOMER_MAP;
            global.DEFAULT_CUSTOMER_ID = configData.defaultCustomerId || INITIAL_DEFAULT_CUSTOMER_ID;
            console.log('✅ App config loaded from Firestore.');
        }

        // --- Initialize Customer Data ---
        const snapshot = await customersCollection.get();
        if (snapshot.empty) {
            console.log('Firestore customers collection is empty. Seeding with initial data...');
            for (const customer of INITIAL_CUSTOMERS_SEED) {
                await customersCollection.doc(customer.id).set(customer);
            }
            customerStates = INITIAL_CUSTOMERS_SEED;
            console.log(`📝 Initial customer data (total: ${INITIAL_CUSTOMERS_SEED.length}) seeded to Firestore.`);
        } else {
            customerStates = snapshot.docs.map(doc => doc.data());
            console.log(`✅ Customer data (total: ${customerStates.length}) loaded from Firestore.`);
        }
    } catch (e) {
        console.error(`❌ Error initializing data from Firestore:`, e.message);
        customerStates = INITIAL_CUSTOMERS_SEED; // Fallback to initial data if Firestore fails
        global.SENDER_CUSTOMER_MAP = INITIAL_SENDER_CUSTOMER_MAP; // Fallback config
        global.DEFAULT_CUSTOMER_ID = INITIAL_DEFAULT_CUSTOMER_ID; // Fallback config
        console.warn('Falling back to in-memory initial data.');
    }
};

// Save / Update a single customer's data in Firestore
const saveCustomerData = async (customerData) => {
    try {
        await customersCollection.doc(customerData.id).set(customerData);
        // console.log(`💾 Customer data for ${customerData.id} saved to Firestore.`); // Terlalu banyak log jika setiap chat
    } catch (e) {
        console.error(`❌ Error saving customer data for ${customerData.id} to Firestore:`, e.message);
    }
};

// Load data saat server dimulai
initializeCustomerData();

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
// Mengembalikan messageId dari WhatsApp API Response
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
        const messageId = response.data.messages && response.data.messages[0] ? response.data.messages[0].id : null;
        return { success: true, detail: response.data, messageId };

    } catch (error) {
        const waError = error.response ? error.response.data : error.message;
        if (waError && waError.error && waError.error.code === 131030) {
            console.error(`❌ [ERROR #131030] Recipient ${target} is not in Allowed List! Add it to Meta Dashboard > Test Numbers.`);
        } else {
            console.error(`❌ [WA SEND FAILED]`, JSON.stringify(waError, null, 2));
        }
        return { success: false, error: "Failed to send to WhatsApp.", details: waError, messageId: null };
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
    firestore_status: admin.apps.length > 0 ? 'Initialized ✅' : 'Not Initialized ❌',
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
    const { message, target, token, phoneId, isTemplate, customerId } = req.body;

    // Token and phoneId are explicitly passed from frontend, so use them directly
    const result = await sendWhatsAppMessageInternal(message, target, token, phoneId, isTemplate);
    
    if (result.success && customerId && result.messageId) {
        // Update customer data in Firestore with sent message status
        const customerDoc = customersCollection.doc(customerId);
        const customerSnapshot = await customerDoc.get();
        if (customerSnapshot.exists) {
            const customerData = customerSnapshot.data();
            const sentMessage = {
                role: 'assistant', // Assuming manual send is usually from agent/assistant
                content: message,
                timestamp: Date.now(),
                whatsapp_message_id: result.messageId,
                status: 'sent',
            };
            customerData.messages.push(sentMessage);
            await saveCustomerData(customerData);
        }
    }

    if (result.success) {
        res.json(result);
    } else {
        res.status(500).json(result);
    }
});

// ==========================================
// 3. API: POLLING PESAN (FRONTEND) - DEPRECATED, will fetch directly from Firestore
// ==========================================
app.get('/api/poll-incoming', (req, res) => {
    console.warn("Frontend is still calling /api/poll-incoming. Please switch to GET /api/customers for updated chat history.");
    res.json({ hasNew: false, messages: [] }); 
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
// NEW API: GET ALL CUSTOMERS (untuk Frontend) - Fetch from Firestore
// ==========================================
app.get('/api/customers', async (req, res) => {
    try {
        const snapshot = await customersCollection.get();
        const customers = snapshot.docs.map(doc => doc.data());
        res.json(customers);
    } catch (e) {
        console.error("❌ Error fetching all customers from Firestore:", e.message);
        res.status(500).json({ success: false, error: "Failed to retrieve customers." });
    }
});

// ==========================================
// NEW API: GET SINGLE CUSTOMER BY ID (untuk Frontend) - Fetch from Firestore
// ==========================================
app.get('/api/customer/:id', async (req, res) => {
    const customerId = req.params.id;
    try {
        const doc = await customersCollection.doc(customerId).get();
        if (doc.exists) {
            res.json(doc.data());
        } else {
            res.status(404).json({ success: false, message: "Customer not found" });
        }
    } catch (e) {
        console.error(`❌ Error fetching customer ${customerId} from Firestore:`, e.message);
        res.status(500).json({ success: false, error: "Failed to retrieve customer." });
    }
});


// ==========================================
// 5. NEW API: CHAT WITH GEMINI (BACKEND-POWERED) - Dipakai untuk manual dari frontend
// ==========================================
app.post('/api/chat-with-gemini', async (req, res) => {
    const { message, customerData: frontendCustomerData, targetPhone } = req.body; 
    let { whatsappToken, whatsappPhoneId } = req.body; // Ambil dari body jika disediakan

    let currentCustomerData;
    try {
        const customerDocRef = customersCollection.doc(frontendCustomerData.id);
        const customerSnapshot = await customerDocRef.get();

        if (!customerSnapshot.exists) {
            // Jika customer ID tidak ditemukan di Firestore, buat dokumen baru
            currentCustomerData = { 
                ...INITIAL_DEFAULT_CUSTOMER_DATA, // Use initial default customer data structure
                ...frontendCustomerData, // Merge with data from frontend
                messages: [] // Ensure messages starts from empty or from frontend.
            };
            if (frontendCustomerData.messages) {
              currentCustomerData.messages = frontendCustomerData.messages;
            }
            await saveCustomerData(currentCustomerData); // Simpan data customer baru ke Firestore
            console.log(`📝 New customer ${currentCustomerData.id} created in Firestore.`);
        } else {
            currentCustomerData = customerSnapshot.data();
            // Hanya tambahkan pesan user dari frontend jika belum ada di backend
            const lastFrontendMessage = frontendCustomerData.messages[frontendCustomerData.messages.length - 1];
            const lastBackendMessage = currentCustomerData.messages[currentCustomerData.messages.length - 1];

            if (lastFrontendMessage && (
                !lastBackendMessage || 
                lastBackendMessage.role !== lastFrontendMessage.role || 
                lastBackendMessage.content !== lastFrontendMessage.content ||
                lastBackendMessage.timestamp !== lastFrontendMessage.timestamp // Check timestamp too
            )) {
                // Tambahkan pesan user yang baru dari frontend
                currentCustomerData.messages.push({
                    ...lastFrontendMessage,
                    timestamp: lastFrontendMessage.timestamp || Date.now() // Ensure timestamp is set
                });
            }
        }
    } catch (e) {
        console.error(`❌ Error managing customer ${frontendCustomerData.id} in Firestore:`, e.message);
        return res.status(500).json({ success: false, error: "Failed to process customer data." });
    }

    // Panggil Gemini
    const aiResponseText = await callGeminiInternal(message, currentCustomerData);
    const aiMsg = { 
        role: 'assistant', 
        content: aiResponseText, 
        timestamp: Date.now(),
        status: 'sent' // Default status for messages initiated from backend
    };
    currentCustomerData.messages.push(aiMsg);
    
    // Simpan perubahan ke Firestore
    await saveCustomerData(currentCustomerData);

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
             const sendResult = await sendWhatsAppMessageInternal(waFormattedText, targetPhone, whatsappToken, whatsappPhoneId, false);
             if (sendResult.success && sendResult.messageId) {
                // Update the sent AI message with actual WhatsApp message ID
                const sentAiMsgIndex = currentCustomerData.messages.findIndex(m => m.timestamp === aiMsg.timestamp && m.content === aiMsg.content);
                if (sentAiMsgIndex !== -1) {
                    currentCustomerData.messages[sentAiMsgIndex].whatsapp_message_id = sendResult.messageId;
                    await saveCustomerData(currentCustomerData); // Save again with messageId
                }
             }
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
            // ===============================
            // INCOMING MESSAGE (USER TO BOT)
            // ===============================
            const msgObj = body.entry[0].changes[0].value.messages[0];
            const from = msgObj.from; 
            const msgBody = msgObj.text ? msgObj.text.body : "[Non-text message]";
            const contacts = body.entry[0].changes[0].value.contacts;
            const name = contacts ? contacts[0].profile.name : "Unknown";
            const incomingPhoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id; // Extract the incoming phone ID
            const incomingMessageId = msgObj.id; // WhatsApp message ID for the incoming message

            console.log(`📩 [NEW MESSAGE] From: ${from} (${name}) | Msg: ${msgBody} | Via Phone ID: ${incomingPhoneNumberId} | WA_ID: ${incomingMessageId}`);

            // Use global SENDER_CUSTOMER_MAP loaded from Firestore
            const customerIdForMessage = global.SENDER_CUSTOMER_MAP[from] || global.DEFAULT_CUSTOMER_ID;
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

            // Dapatkan customerData dari Firestore
            const customerDocRef = customersCollection.doc(customerIdForMessage);
            let customerSnapshot = await customerDocRef.get();
            let customerDataToProcess;

            if (!customerSnapshot.exists) {
                // Jika customer baru, buat entri baru berdasarkan default
                customerDataToProcess = {
                    ...INITIAL_DEFAULT_CUSTOMER_DATA, // Use initial default customer data structure
                    id: customerIdForMessage,
                    peserta_profile: {
                        ...INITIAL_DEFAULT_CUSTOMER_DATA.peserta_profile,
                        no_hp_masked: from
                    },
                    messages: [] // Mulai dengan pesan kosong
                };
            } else {
                customerDataToProcess = customerSnapshot.data();
            }

            // Tambahkan pesan user ke riwayat chat
            const userMsg = { 
                role: 'user', 
                content: msgBody, 
                timestamp: Date.now(),
                whatsapp_message_id: incomingMessageId, // Store incoming WA ID as well
                status: 'received' // Status for incoming messages
            };
            customerDataToProcess.messages.push(userMsg);
            
            // --- Panggil AI dan Balas WhatsApp (Otomatis dari Backend) ---
            const aiResponseText = await callGeminiInternal(msgBody, customerDataToProcess);
            const aiMsg = { 
                role: 'assistant', 
                content: aiResponseText, 
                timestamp: Date.now(),
                status: 'sent' // Initial status
            };
            customerDataToProcess.messages.push(aiMsg); // Add to local data for Gemini context
            
            // Kirim balasan ke WhatsApp (gunakan token yang sesuai dengan incomingPhoneNumberId)
            const { token: waTokenForReply, envType: envTypeForReply } = getAccessTokenForPhoneId(incomingPhoneNumberId);

            let sentMessageId = null;
            if (waTokenForReply && incomingPhoneNumberId && !isSimulation) { 
                const waFormattedText = formatToWhatsApp(aiResponseText);
                const sendResult = await sendWhatsAppMessageInternal(waFormattedText, from, waTokenForReply, incomingPhoneNumberId, false);
                if (sendResult.success) {
                    sentMessageId = sendResult.messageId;
                    console.log(`✅ AI Response sent to WA. Message ID: ${sentMessageId}`);
                } else {
                    aiMsg.status = 'failed';
                    console.error(`❌ Failed to send AI response to WA for customer ${customerIdForMessage}.`);
                }
            } else if (!waTokenForReply || !incomingPhoneNumberId) {
                console.warn(`WHATSAPP_ACCESS_TOKEN or PHONE_ID for ${envTypeForReply} environment not set/found for auto-reply.`);
                aiMsg.status = 'failed';
            }
            // Update AI message with actual sent message ID
            if (sentMessageId) {
                aiMsg.whatsapp_message_id = sentMessageId;
            }

            // Perbarui customerData di Firestore
            await saveCustomerData(customerDataToProcess);
            
            return { success: true, type: 'message', data: userMsg, aiResponse: aiMsg };

        } 
        else if (
            body.entry &&
            body.entry[0].changes &&
            body.entry[0].changes[0].value.statuses &&
            body.entry[0].changes[0].value.statuses[0]
        ) {
            // ===============================
            // STATUS UPDATE (BOT TO USER)
            // ===============================
            const statusObj = body.entry[0].changes[0].value.statuses[0];
            const messageId = statusObj.id; // WhatsApp message ID
            const status = statusObj.status; // 'delivered', 'read'
            const recipientId = statusObj.recipient_id; // Phone ID of the recipient
            const timestamp = parseInt(statusObj.timestamp) * 1000; // Convert to milliseconds

            console.log(`📣 [MSG STATUS] Status update for WA_ID: ${messageId} | Status: ${status} | Recipient: ${recipientId}`);

            // Cari customer yang memiliki pesan dengan messageId ini
            // Ini mungkin tidak efisien untuk ribuan customer. Optimalisasi bisa dengan menyimpan mapping messageId ke customerId
            let foundCustomer = null;
            let foundMessageIndex = -1;

            // Iterate through the in-memory cache
            for (const customer of customerStates) {
                const messageIndex = customer.messages.findIndex(
                    msg => msg.whatsapp_message_id === messageId
                );
                if (messageIndex !== -1) {
                    foundCustomer = customer;
                    foundMessageIndex = messageIndex;
                    break;
                }
            }
            
            if (foundCustomer && foundMessageIndex !== -1) {
                foundCustomer.messages[foundMessageIndex].status = status;
                // Optionally update timestamp for when status changed
                if (!foundCustomer.messages[foundMessageIndex].timestamp_status_updated) { // To avoid overwriting original msg timestamp
                    foundCustomer.messages[foundMessageIndex].timestamp_status_updated = timestamp;
                }
                await saveCustomerData(foundCustomer);
                console.log(`✅ Message WA_ID: ${messageId} status updated to '${status}' for customer ${foundCustomer.id}.`);
            } else {
                console.warn(`⚠️ Could not find customer or message for WA_ID: ${messageId} to update status.`);
            }

            return { success: true, type: 'status', data: statusObj };
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