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
   https://bpjsgenairich-copy-production.up.railway.app/webhook
   ```
3. **Verify Token**:
   ```
   rich-ai-verify-token
   ```
4. Klik **Verify and Save**.

### ⚠️ WAJIB: SUBSCRIBE FIELDS
Setelah Verify and Save berhasil:
1. Klik tombol **Manage** di sebelah tulisan *Webhook fields*.
2. Cari kolom **messages** (v24.0 atau terbaru).
3. **KLIK SUBSCRIBE (Centang)**.
4. Klik **Done**.

---

## 5. SOLUSI JIKA PESAN TIDAK MASUK (TROUBLESHOOTING)

Jika Anda sudah mengirim pesan dari WA tapi server tidak merespon, periksa ini:

### A. Tambahkan Nomor Anda sebagai TESTER (Wajib di Mode Development)
Saat App masih dalam **Development Mode** (lihat pojok kiri atas dashboard), Bot **TIDAK AKAN** merespon nomor sembarangan.
1. Buka Meta Dashboard -> Menu **WhatsApp** -> **API Setup**.
2. Scroll ke bagian **"To"** (Step 5: Send a message).
3. Klik **Manage phone number list**.
4. **Tambahkan nomor WA asli Anda** yang digunakan untuk mengetes.
5. Anda akan menerima kode OTP di WA. Masukkan kode tersebut untuk verifikasi.
6. **Hanya nomor yang sudah diverifikasi di sini yang bisa chat dengan Bot saat mode Development.**

### B. Mulai Percakapan Dulu
WhatsApp membatasi bot untuk memulai chat ke user (kecuali via Template).
1. Pastikan Anda (sebagai User) mengirim pesan "Halo" duluan ke nomor Bot.
2. Atau, kirim Template "Hello World" / "Jaspers Market" dari dashboard aplikasi RICH terlebih dahulu.

### C. Cek Log Backend
Buka dashboard Railway, klik tab **Logs**. Jika tidak ada log sama sekali saat Anda kirim pesan, berarti masalahnya ada di **Poin A (Nomor belum terdaftar sebagai tester)**.