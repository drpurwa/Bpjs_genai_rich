// ==========================================
// KONFIGURASI SERVER
// ==========================================

const LOCAL_BACKEND_URL = 'http://localhost:3001';

// [INSTRUKSI RAILWAY]
// 1. Deploy folder backend ke Railway.
// 2. Copy Public URL dari Railway (contoh: https://rich-backend-production.up.railway.app).
// 3. Paste URL tersebut di bawah ini menggantikan string kosong.
const LIVE_BACKEND_URL = 'https://bpjsgenairich-new-production.up.railway.app'; 

// Ganti variable ini ke LIVE_BACKEND_URL jika sudah deploy ke Railway
// Agar Frontend (yang berjalan di local/Vercel) bisa menghubungi Backend di Railway
export const API_BASE_URL = LIVE_BACKEND_URL || LOCAL_BACKEND_URL;

// CUSTOMERS array dan INITIAL_CUSTOMER_DATA kini akan diambil dari backend/Firestore.
// Tidak lagi didefinisikan di frontend constants.
