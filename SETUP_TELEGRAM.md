# Panduan Setup Telegram Bot untuk RICH AI

## 1. Buat Bot di Telegram
1. Buka Telegram, cari **@BotFather**.
2. Ketik `/newbot`.
3. Beri nama bot (misal: `Rich Assistant`).
4. Beri username bot (harus unik & akhiran 'bot', misal: `Rich_Demo_Bot`).
5. **Salin API Token** yang diberikan (format: `123456:ABC-Def...`).

## 2. Deploy Backend (Wajib HTTPS)
Bot Telegram membutuhkan URL HTTPS publik untuk Webhook (menerima pesan).
1. Deploy folder `backend/` ke **Railway.app** (atau Vercel/Heroku).
2. Pastikan Root Directory di set ke `/backend`.
3. Setelah deploy, copy **Public Domain** (misal: `https://rich-backend.up.railway.app`).

## 3. Konfigurasi Frontend
1. Buka file `constants.ts`.
2. Isi `LIVE_BACKEND_URL` dengan domain Railway Anda.
   ```typescript
   const LIVE_BACKEND_URL = 'https://rich-backend.up.railway.app';
   ```

## 4. Koneksi di Dashboard App
1. Jalankan aplikasi frontend (`npm start`).
2. Buka **Panel Kontrol** (Icon Gear ⚙️ di pojok kanan atas).
3. Isi **Bot Token** dengan token dari BotFather.
4. Klik tombol **Cek Token** (sebelah kolom input).
5. Nyalakan toggle **"TELEGRAM BOT: OFF"** menjadi **ON**.
6. Klik **"Lihat Detail Koneksi & Webhook"**.
7. Klik **"Setup Webhook"**. Pastikan muncul pesan sukses.

## 5. Cara Pakai (User vs Agent)
Agar bot bisa mengirim pesan, User harus memulai percakapan dulu.

**Cara Mendapatkan Chat ID:**
1. Buka Bot Anda di Telegram.
2. Ketik `/start` atau pesan apapun (misal: "Halo").
3. Di Dashboard App, lihat panel debug (Detail Koneksi).
4. Akan muncul log "Incoming Msg" beserta **Sender ID**.
5. Copy ID tersebut ke kolom **Target Chat ID**.

**Testing:**
- **Kirim dari App:** Klik tombol "Kirim" atau ketik di chat box -> Masuk ke Telegram.
- **Balas dari Telegram:** Balas chat di Telegram -> Masuk ke App secara realtime.
