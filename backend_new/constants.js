// === PEMETAAN NOMOR TELEPON KE CUSTOMER ID ===
// Peta ini menghubungkan nomor telepon WhatsApp pengirim ke ID pelanggan internal Anda.
// Sesuaikan sesuai dengan data CUSTOMERS yang Anda miliki di frontend.
const SENDER_CUSTOMER_MAP = {
  '6282111164113': 'CONV_20250510_000023', // Contoh: Nomor ini dipetakan ke CUSTOMER_1
  '628122123232': 'CONV_20250510_000102', // Contoh: Nomor ini dipetakan ke CUSTOMER_4
  '628123810892': 'ACTIVE_ENGAGE_000111', // Contoh: Nomor ini dipetakan ke CUSTOMER_5
  '6285216669394': 'CONV_20250510_000023' // Contoh: Nomor ini dipetakan ke CUSTOMER_1
  // Tambahkan pemetaan lain di sini
};

// ID pelanggan default jika nomor pengirim tidak ditemukan di peta.
// Ini harus sesuai dengan salah satu ID dari array CUSTOMERS di frontend.
const DEFAULT_CUSTOMER_ID = 'CONV_20250510_000023'; // Default ke CUSTOMER_1 ID

module.exports = {
  SENDER_CUSTOMER_MAP,
  DEFAULT_CUSTOMER_ID,
};