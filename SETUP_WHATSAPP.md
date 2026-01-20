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

## 4. Konfigurasi Webhook (YANG SEDANG ANDA BUKA)
Di Meta Dashboard -> **WhatsApp** -> **Configuration** -> **Edit Webhook**:

1. **Callback URL**:
   ```
   https://bpjsgenairich-production.up.railway.app/webhook
   ```
   *(Pastikan tidak ada spasi)*

2. **Verify Token**:
   ```
   rich-ai-verify-token
   ```

3. Klik **Verify and Save**.
4. Jika error, pastikan Server Railway sudah aktif (Cek log di Railway).
5. Setelah sukses, klik **Manage** -> Centang **messages** -> Done.

## 5. Testing
1. Klik tombol **"WHATSAPP BOT: ON"**.
2. Klik **"Kirim Template (Hello World)"**.
3. Balas pesan di WA untuk tes pesan masuk.
