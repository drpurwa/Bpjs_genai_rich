import { API_BASE_URL } from '../constants';
import { CustomerData, Message } from '../types';

// Fungsi fallback untuk respons jika ada masalah dengan AI atau koneksi
// Perlu disesuaikan karena AI sekarang dipicu di backend
const getFallbackResponse = (message: string, customerId: string | null): string => {
  const msg = message.toLowerCase();

  if (customerId === 'CONV_20250510_000023') { // CUSTOMER_1 ID
    if (msg.includes('males') || msg.includes('ndak butuh')) {
      return "Ibu, kami lihat Agustus tahun lalu Ibu sempat dirawat di RS Sardjito karena DBD (biaya Rp8,5 jt ditanggung penuh). Sayang kalau sekarang kartu nonaktif cuma karena iuran Rp70.000. Yuk dibayar hari ini agar tetap tenang. 😊";
    }
  }
  if (customerId === 'CONV_20250511_000001') { // CUSTOMER_2 ID
      if (msg.includes('lupa') || msg.includes('telat')) {
          return "Bapak, agar tidak lupa lagi, bagaimana kalau kita aktifkan fitur Autodebet di Mobile JKN? Iuran akan terpotong otomatis tiap bulan. 😊";
      }
  }
  if (customerId === 'CONV_20250511_000101') { // CUSTOMER_3 ID
      if (msg.includes('gagal autodebet') || msg.includes('saldo')) {
          return "Bapak, terkait autodebet yang gagal, biasanya karena saldo rekening tidak mencukupi saat tanggal penarikan. Apakah Bapak sudah sempat mengisi saldo rekeningnya?";
      }
  }

  return "Salam Sehat, PANDAWA di sini. Mohon maaf pesan anda belum bisa saya proses?";
};

// Fungsi ini kini hanya untuk MENGIRIM PESAN MANUAL DARI FRONTEND ke backend,
// dan backend yang akan memproses AI & menyimpannya.
// Ini TIDAK lagi digunakan untuk polling pesan masuk.
export const callGeminiBackend = async (message: string, customerData: CustomerData, targetPhone: string, whatsappToken: string, phoneId: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-with-gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, customerData, targetPhone, whatsappToken, phoneId }), // Kirim semua data yang diperlukan
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend Gemini API Error (manual send):", errorData);
      return getFallbackResponse(message, customerData.id); // Fallback jika backend gagal
    }

    const data = await response.json();
    return data.response || getFallbackResponse(message, customerData.id);

  } catch (error) {
    console.error("Network or Backend Error when calling Gemini (manual send):", error);
    return getFallbackResponse(message, customerData.id); // Fallback jika error
  }
};