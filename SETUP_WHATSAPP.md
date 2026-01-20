# Panduan Setup WhatsApp Cloud API untuk RICH AI

## 1. Buat App di Meta Developers
1. Buka [developers.facebook.com](https://developers.facebook.com/).
2. Buat App baru -> Pilih **Business** (Lainnya) -> Pilih **WhatsApp**.
3. Di Dashboard App, cari menu **WhatsApp** -> **API Setup**.

## 2. Dapatkan Credentials
Di halaman **API Setup**, Anda akan melihat:
1. **Temporary Access Token**: Copy ini (berlaku 24 jam). Untuk permanen, buat System User di Business Manager.
2. **Phone Number ID**: Copy ID ini (contoh: `1234567890`).
3. **Test Number**: Pastikan Anda menambahkan nomor HP Anda sendiri di bagian "To" agar bisa menerima pesan saat mode Development.

## 3. Konfigurasi Frontend
1. Buka Dashboard Aplikasi RICH.
2. Klik Icon Gear ⚙️.
3. Masukkan **Meta Access Token** dan **Phone Number ID**.
4. Masukkan **Target Phone** (nomor WA Anda, format `628...`).
5. Klik tombol **"?"** untuk memverifikasi koneksi.

## 4. Konfigurasi Webhook (Wajib agar Bot bisa membalas)
Agar bot bisa membaca pesan masuk dari User:
1. Pastikan backend sudah dideploy ke **Railway** (HTTPS).
2. Di Meta Dashboard, masuk menu **WhatsApp** -> **Configuration**.
3. Klik **Edit** pada bagian Webhook.
4. **Callback URL**: Masukkan URL Railway Anda + `/webhook` (contoh: `https://rich-backend.up.railway.app/webhook`).
5. **Verify Token**: Masukkan `rich-ai-verify-token` (ini sudah di-hardcode di backend `server.js`).
6. Klik **Verify and Save**.
7. Klik **Manage** (Webhook Fields) -> Centang **messages** -> Done.

## 5. Testing
1. Klik tombol **"WHATSAPP BOT: ON"**.
2. Klik **"Kirim Template (Hello World)"**. Cek WA Anda, harusnya ada pesan masuk.
3. Balas pesan tersebut di WA. Pesan harusnya muncul di Aplikasi RICH secara realtime.
