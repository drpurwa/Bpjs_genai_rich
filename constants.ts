import { CustomerData, KnowledgeBase } from './types';

// ==========================================
// KONFIGURASI SERVER
// ==========================================

const LOCAL_BACKEND_URL = 'http://localhost:3001';

// [INSTRUKSI RAILWAY]
// 1. Deploy folder backend ke Railway.
// 2. Copy Public URL dari Railway (contoh: https://rich-backend-production.up.railway.app).
// 3. Paste URL tersebut di bawah ini menggantikan string kosong.
const LIVE_BACKEND_URL = ''; 

// Ganti variable ini ke LIVE_BACKEND_URL jika sudah deploy ke Railway
// Agar Frontend (yang berjalan di local/Vercel) bisa menghubungi Backend di Railway
export const API_BASE_URL = LIVE_BACKEND_URL || LOCAL_BACKEND_URL;

// ==========================================
// DATA PESERTA 1: IBU (WIRASWASTA) - Hard Complainer / Low Credibility
// ==========================================
const CUSTOMER_1: CustomerData = {
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
    }
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

// ==========================================
// DATA PESERTA 2: BAPAK (FORGETFUL PAYER) - Soft Reminder
// ==========================================
const CUSTOMER_2: CustomerData = {
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

// ==========================================
// DATA PESERTA 3: BAPAK (RELIABLE PAYER) - Autodebet Gagal
// ==========================================
const CUSTOMER_3: CustomerData = {
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

// ==========================================
// DATA PESERTA 4: IBU (FINANCIAL STRUGGLE) - REHAB
// ==========================================
const CUSTOMER_4: CustomerData = {
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

// ==========================================
// DATA PESERTA 5: BAPAK (ACTIVE MEMBER) - ENGAGEMENT
// ==========================================
const CUSTOMER_5: CustomerData = {
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
    "primary_goal": "Edukasi Mobile JKN dan autodebit",
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

export const CUSTOMERS = [CUSTOMER_1, CUSTOMER_2, CUSTOMER_3, CUSTOMER_4, CUSTOMER_5];

// Default export is Customer 1
export const INITIAL_CUSTOMER_DATA = CUSTOMER_1;

// ==========================================
// KNOWLEDGE BASE
// ==========================================
export const KNOWLEDGE_BASE_DATA: KnowledgeBase = {
  "metadata": {
    "version": "2025.05.10",
    "last_updated": "2025-05-10T10:00:00Z",
    "total_entries": 45,
    "categories": [
      "Pembayaran",
      "Autodebet",
      "Kepesertaan",
      "Klaim",
      "Teknis Aplikasi",
      "Kebijakan & Regulasi",
      "Program Khusus (REHAB)"
    ]
  },
  "kb_entries": [
    // ============================================
    // KATEGORI: PEMBAYARAN
    // ============================================
    {
      "kb_id": "PAY_001",
      "category": "Pembayaran",
      "topic": "Cara Bayar via Virtual Account",
      "keywords": ["bayar", "VA", "virtual account", "transfer"],
      "content": {
        "summary": "Peserta PBPU dapat membayar iuran melalui Virtual Account di berbagai channel.",
        "detail": {
          "virtual_account_format": "88888 + [11 digit terakhir nomor kartu]",
          "available_channels": [
            "Mobile Banking (BCA, Mandiri, BRI, BNI, CIMB, dll)",
            "ATM",
            "Indomaret/Alfamart",
            "Tokopedia/Shopee/Bukalapak",
            "GoPay/OVO/DANA"
          ],
          "processing_time": "Maksimal 1x24 jam setelah pembayaran",
          "cut_off_time": "Pembayaran setelah jam 22:00 akan diproses keesokan hari"
        },
        "faq": [
          {
            "question": "Kalau bayar lewat Indomaret gimana?",
            "answer": "Datang ke kasir Indomaret, bilang 'Bayar BPJS', kasir akan minta nomor VA: 88888 + nomor kartu. Bayar sesuai nominal tunggakan."
          }
        ]
      },
      "last_verified": "2025-05-01"
    },
    
    {
      "kb_id": "PAY_002",
      "category": "Pembayaran",
      "topic": "Iuran Per Kelas",
      "keywords": ["iuran", "tarif", "kelas 1", "kelas 2", "kelas 3"],
      "content": {
        "summary": "Tarif iuran BPJS Kesehatan berbeda per kelas rawat.",
        "detail": {
          "kelas_1": 150000,
          "kelas_2": 100000,
          "kelas_3": 42000,
          "effective_date": "2024-01-01",
          "note": "Tarif per jiwa per bulan. Untuk keluarga dengan 2 anggota kelas 3 = Rp84.000/bulan"
        }
      },
      "last_verified": "2025-05-01"
    },
    
    {
      "kb_id": "PAY_003",
      "category": "Pembayaran",
      "topic": "Pembayaran Tunggakan",
      "keywords": ["tunggakan", "telat bayar", "denda"],
      "content": {
        "summary": "Peserta yang menunggak harus melunasi seluruh tunggakan untuk mengaktifkan kembali kepesertaan.",
        "detail": {
          "rules": [
            "Tunggakan 1 bulan: Kartu masih aktif, tapi segera bayar",
            "Tunggakan 2 bulan: Kartu akan nonaktif bulan depan",
            "Tunggakan 3+ bulan: Kartu nonaktif, tidak bisa klaim"
          ],
          "no_penalty": "Tidak ada denda keterlambatan untuk PBPU",
          "reactivation": "Setelah lunas, kartu aktif dalam 1x24 jam"
        }
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: AUTODEBET
    // ============================================
    {
      "kb_id": "AUTO_001",
      "category": "Autodebet",
      "topic": "Cara Daftar Autodebet",
      "keywords": ["autodebet", "daftar", "otomatis", "potong rekening"],
      "content": {
        "summary": "Autodebet memungkinkan iuran terpotong otomatis dari rekening bank.",
        "detail": {
          "registration_steps": [
            "1. Buka aplikasi Mobile JKN dengan Link https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id",
            "2. Login dengan NIK dan password",
            "3. Pilih menu 'Menu Lainnya'",
            "4. Pilih menu 'Pendaftaran Autodebet'",
            "5. Pilih bank (BCA/Mandiri/BRI/BNI/CIMB/Permata)",
            "6. Masukkan nomor rekening dan nomor HP",
            "7. Ikuti proses verifikasi (SMS OTP atau Mobile Banking)",
            "8. Selesai! Autodebet aktif mulai bulan depan"
          ],
          "requirements": [
            "Rekening aktif atas nama peserta atau kepala keluarga",
            "Saldo mencukupi saat tanggal pendebetan",
            "Nomor HP aktif untuk notifikasi"
          ],
          "debet_schedule": [
            "Tanggal 1-10: Autodebet di tanggal 5",
            "Tanggal 11-20: Autodebet di tanggal 20"
          ],
          "supported_banks": [
            "BCA", "Mandiri", "BRI", "BNI", "CIMB Niaga", 
            "Permata", "Bank DKI", "BJB"
          ]
        },
        "faq": [
          {
            "question": "Kalau saldo kurang saat autodebet, gimana?",
            "answer": "Autodebet gagal. Peserta harus bayar manual via VA. Bulan depan autodebet akan coba lagi otomatis."
          },
          {
            "question": "Bisa ganti rekening autodebet?",
            "answer": "Bisa. Hapus autodebet lama di Mobile JKN, lalu daftar ulang dengan rekening baru."
          }
        ]
      },
      "last_verified": "2025-05-01"
    },
    
    {
      "kb_id": "AUTO_002",
      "category": "Autodebet",
      "topic": "Troubleshooting Autodebet Gagal",
      "keywords": ["autodebet gagal", "tidak terpotong", "error"],
      "content": {
        "summary": "Penyebab umum autodebet gagal dan solusinya.",
        "detail": {
          "common_issues": [
            {
              "issue": "Saldo tidak cukup",
              "solution": "Pastikan saldo mencukupi H-1 tanggal pendebetan. Jika gagal, bayar manual via VA."
            },
            {
              "issue": "Rekening diblokir/tidak aktif",
              "solution": "Hubungi bank untuk aktivasi rekening, lalu daftar ulang autodebet."
            },
            {
              "issue": "Data rekening salah",
              "solution": "Hapus autodebet di Mobile JKN, daftar ulang dengan data benar."
            },
            {
              "issue": "Bank sedang maintenance",
              "solution": "Coba lagi keesokan hari, atau bayar manual via VA."
            }
          ]
        }
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: KEPESERTAAN
    // ============================================
    {
      "kb_id": "MEMBER_001",
      "category": "Kepesertaan",
      "topic": "Status Kepesertaan",
      "keywords": ["status", "aktif", "nonaktif", "cek kartu"],
      "content": {
        "summary": "Cara mengecek status kepesertaan JKN.",
        "detail": {
          "check_methods": [
            "1. Aplikasi Mobile JKN → Menu 'Data Peserta'",
            "2. Website BPJS Kesehatan → Login → Cek Status",
            "3. WhatsApp PANDAWA: ketik 'Cek Status' + NIK",
            "4. Call Center 1500400"
          ],
          "status_types": {
            "aktif": "Iuran lunas, bisa klaim",
            "nonaktif": "Ada tunggakan, tidak bisa klaim sampai lunas",
            "suspend": "Kartu diblokir karena tunggakan >6 bulan atau fraud"
          }
        }
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: PROGRAM KHUSUS - REHAB
    // ============================================
    {
      "kb_id": "REHAB_001",
      "category": "Program Khusus",
      "topic": "Program REHAB (Cicilan)",
      "keywords": ["cicilan", "rehab", "angsuran", "nunggak lama"],
      "content": {
        "summary": "Program REHAB memungkinkan peserta mencicil tunggakan.",
        "detail": {
          "eligibility": "Tunggakan minimal 3 bulan",
          "tenor_options": [
            "3 bulan",
            "6 bulan",
            "12 bulan"
          ],
          "example_calculation": {
            "tunggakan": 420000,
            "tenor": 12,
            "cicilan_per_bulan": 35000,
            "iuran_berjalan": 42000,
            "total_bayar_per_bulan": 77000
          },
          "registration_steps": [
            "1. Buka Mobile JKN",
            "2. Pilih menu 'Rencana Pembayaran Bertahap (REHAB)'",
            "3. Pilih tenor (3/6/12 bulan)",
            "4. Sistem akan generate jadwal cicilan",
            "5. Bayar cicilan via VA setiap bulan"
          ],
          "important_notes": [
            "Kartu akan aktif setelah cicilan LUNAS semua",
            "Jika telat bayar cicilan, harus restart dari awal",
            "Iuran bulan berjalan tetap harus dibayar"
          ]
        },
        "faq": [
          {
            "question": "Kalau nunggak 12 bulan (Rp504.000), bisa cicil berapa?",
            "answer": "Bisa cicil 12x (Rp42.000/bulan) + iuran berjalan (Rp42.000) = Rp84.000/bulan."
          },
          {
            "question": "Bisa klaim saat cicilan belum lunas?",
            "answer": "Tidak bisa. Kartu aktif setelah cicilan lunas semua."
          }
        ]
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: TEKNIS APLIKASI
    // ============================================
    {
      "kb_id": "APP_001",
      "category": "Teknis Aplikasi",
      "topic": "Cara Download & Install Mobile JKN",
      "keywords": ["mobile jkn", "aplikasi", "download", "install"],
      "content": {
        "summary": "Panduan download aplikasi Mobile JKN.",
        "detail": {
          "android": {
            "link": "https://play.google.com/store/apps/details?id=app.bpjs.mobile",
            "min_version": "Android 5.0"
          },
          "ios": {
            "link": "https://apps.apple.com/id/app/mobile-jkn/id1237601115",
            "min_version": "iOS 11.0"
          },
          "first_time_login": [
            "1. Masukkan NIK (16 digit)",
            "2. Masukkan tanggal lahir (DD-MM-YYYY)",
            "3. Buat password baru (minimal 6 karakter)",
            "4. Verifikasi email/nomor HP"
          ]
        }
      },
      "last_verified": "2025-05-01"
    },
    
    // ============================================
    // KATEGORI: KEBIJAKAN & REGULASI
    // ============================================
    {
      "kb_id": "POLICY_001",
      "category": "Kebijakan",
      "topic": "Perbedaan PBI, PBPU, PPU",
      "keywords": ["pbi", "pbpu", "ppu", "jenis peserta"],
      "content": {
        "summary": "Klasifikasi peserta BPJS Kesehatan.",
        "detail": {
          "PBI": {
            "full_name": "Penerima Bantuan Iuran",
            "description": "Peserta yang iurannya dibayar pemerintah (fakir miskin, orang tidak mampu)",
            "iuran": "Rp0 (gratis)",
            "kelas": "Kelas 3"
          },
          "PBPU": {
            "full_name": "Peserta Bukan Penerima Upah",
            "description": "Peserta mandiri (wiraswasta, freelance, tidak bekerja)",
            "iuran": "Rp42.000 - Rp150.000/jiwa (tergantung kelas)",
            "kelas": "Bisa pilih kelas 1/2/3"
          },
          "PPU": {
            "full_name": "Peserta Penerima Upah",
            "description": "Pekerja formal (PNS, TNI/Polri, pegawai swasta)",
            "iuran": "Dipotong gaji otomatis oleh pemberi kerja",
            "kelas": "Sesuai gaji"
          }
        }
      },
      "last_verified": "2025-05-01"
    }
  ]
};