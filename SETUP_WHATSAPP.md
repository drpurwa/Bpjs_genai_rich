# Panduan Setup WhatsApp Cloud API untuk RICH AI

## 1. Buat App di Meta Developers
1. Buka [developers.facebook.com](https://developers.facebook.com/).
2. Buat App baru -> Pilih **Business** (Lainnya) -> Pilih **WhatsApp**.
3. Di Dashboard App, cari menu **WhatsApp** -> **API Setup**.

## 2. Dapatkan Credentials
Di halaman **API Setup**, Anda akan melihat:
1. **Temporary Access Token**: Copy ini.
2. **Phone Number ID**: Copy ID ini.
3. **Test Number**: Tambahkan nomor HP Anda sendiri di bagian "To".

## 3. Konfigurasi Frontend
1. Buka Dashboard Aplikasi RICH (Icon Gear ⚙️).
2. Masukkan **Meta Access Token** dan **Phone Number ID**.
3. Masukkan **Target Phone** (nomor WA Anda, format `628...`).

## 4. Konfigurasi Webhook (PENTING!)
Di Meta Dashboard -> **WhatsApp** -> **Configuration**:

1. Klik **Edit** pada bagian Webhook.
2. **Callback URL**:
   ```
   https://bpjsgenairich-production.up.railway.app/webhook
   ```
3. **Verify Token**:
   ```
   rich-ai-verify-token
   ```
4. Klik **Verify and Save**.

### ⚠️ WAJIB DILAKUKAN AGAR PESAN MASUK:
Setelah Verify and Save berhasil, lihat bagian **Webhook fields**.
1. Klik tombol **Manage**.
2. Cari kolom **messages** di dalam tabel.
3. Klik **Subscribe** (Centang) pada kolom `messages`.
4. (Opsional) Anda bisa juga subscribe ke `message_echoes` atau `message_deliveries`.
5. Klik **Done**.

**Jika langkah ini tidak dilakukan, Meta tidak akan mengirim pesan chat ke server Anda, meskipun tes koneksi berhasil.**

## 5. Testing
1. Klik tombol **"WHATSAPP BOT: ON"** di Aplikasi RICH.
2. Klik **"Kirim Template (Jaspers Market)"**.
3. Balas pesan tersebut lewat WhatsApp di HP Anda.
4. Cek Log di Dashboard Railway untuk melihat data mentah pesan yang masuk.
