
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CustomerData } from '../types';
import { KNOWLEDGE_BASE_DATA } from '../constants';

let chatSession: Chat | null = null;
let aiInstance: GoogleGenAI | null = null;
let currentCustomerId: string | null = null;

export const initializeGeminiChat = (data: CustomerData) => {
  const apiKey = process.env.API_KEY;
  currentCustomerId = data.id;
  
  if (!apiKey) {
    console.error("API Key is missing!");
    return null;
  }

  aiInstance = new GoogleGenAI({ apiKey });
  const customSystemMessage = data.messages.find(m => m.role === 'system')?.content || "";

  let systemInstruction = `
    Anda adalah PANDAWA (Pelayanan Administrasi Melalui Whatsapp), asisten virtual resmi BPJS Kesehatan.
    
    =========== STATUS & KONTEKS SAAT INI ===========
    Status No. WA User: TERDAFTAR (di DB SIKAT)
    
    =========== DATA PERSONAL PESERTA ===========
    Profil: ${JSON.stringify(data.peserta_profile)}
    Tagihan: ${JSON.stringify(data.billing_info)}
    Klaim Terakhir: ${JSON.stringify(data.claim_history)}

    =========== KNOWLEDGE BASE ===========
    ${JSON.stringify(KNOWLEDGE_BASE_DATA.kb_entries, null, 2)}

    =========== GAYA BICARA ===========
    Gunakan Bahasa Indonesia yang sopan, ramah, dan solutif. Jawab pertanyaan peserta berdasarkan data profil dan knowledge base yang disediakan.
    JANGAN memberikan format JSON atau tag khusus seperti [INVOICE_DATA]. Berikan jawaban dalam bentuk teks Markdown yang rapi saja.
  `;

  if (customSystemMessage) {
    systemInstruction += `\n\n=========== INSTRUKSI KHUSUS PESERTA INI ===========\n${customSystemMessage}`;
  }

  chatSession = aiInstance.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.3,
    },
    history: data.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
  });

  return chatSession;
};

const getFallbackResponse = (message: string, customerId: string | null): string => {
  const msg = message.toLowerCase();

  if (customerId?.includes('000023')) {
    if (msg.includes('males') || msg.includes('sehat')) {
      return "Ibu, kami lihat Agustus tahun lalu Ibu sempat dirawat di RS Sardjito karena DBD (biaya Rp8,5 jt ditanggung penuh). Sayang kalau sekarang kartu nonaktif cuma karena iuran Rp70.000. Yuk dibayar hari ini agar tetap tenang. 😊";
    }
  }

  return "Selamat siang, PANDAWA di sini. Ada yang bisa kami bantu terkait kepesertaan JKN Anda?";
};

export const sendMessageToGemini = async (message: string, customerId?: string): Promise<string> => {
  if (!chatSession) return getFallbackResponse(message, customerId || currentCustomerId);
  try {
    const result: GenerateContentResponse = await chatSession.sendMessage({ message });
    return result.text || getFallbackResponse(message, customerId || currentCustomerId);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getFallbackResponse(message, customerId || currentCustomerId);
  }
};
