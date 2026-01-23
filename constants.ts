// ==========================================
// KONFIGURASI SERVER
// ==========================================

const LOCAL_BACKEND_URL = 'http://localhost:3001';

// [INSTRUKSI RAILWAY]
// 1. Deploy folder backend ke Railway.
// 2. Copy Public URL dari Railway (contoh: https://rich-backend-production.up.railway.app).
// 3. Paste URL tersebut di bawah ini menggantikan string kosong.
const LIVE_BACKEND_URL = 'https://bpjsgenairich-copy-production.up.railway.app'; 

// Ganti variable ini ke LIVE_BACKEND_URL jika sudah deploy ke Railway
// Agar Frontend (yang berjalan di local/Vercel) bisa menghubungi Backend di Railway
export const API_BASE_URL = LIVE_BACKEND_URL || LOCAL_BACKEND_URL;

// CUSTOMERS array dan INITIAL_CUSTOMER_DATA telah dipindahkan ke backend/customerData.js
// Frontend akan fetch data ini dari backend.
export const CUSTOMERS: any[] = []; // Placeholder untuk kompilasi, akan diisi dari backend
export const INITIAL_CUSTOMER_DATA: any = { // Placeholder
  "id": "LOADING",
  "peserta_profile": { "nokapst_masked": "Memuat...", "status_kepesertaan": "Memuat...", "kelas_rawat": "-", "jumlah_tanggungan": 0, "usia": 0, "gender": "N/A" },
  "billing_info": { "total_tunggakan": 0, "bulan_menunggak": [], "durasi_bulan": 0, "last_payment_date": "" },
  "interaction_history": { "last_contact": { "agent_name": "", "date": "", "channel": "", "outcome": "", "alasan_tunggak": "" } },
  "payment_commitment_history": { "credibility_score": 0 },
  "claim_history": { "last_claim": { "date": "", "type": "", "diagnosis": "", "hospital": "", "claim_amount": 0 } },
  "strategy": { "approach": "", "urgency": "", "tone": "" },
  "messages": []
};
