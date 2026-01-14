import React, { useState, useEffect } from 'react';
import { CustomerPanel } from './components/CustomerPanel';
import { ChatInterface } from './components/ChatInterface';
import { CUSTOMERS, API_BASE_URL } from './constants';
import { Message, CustomerData } from './types';
import { initializeGeminiChat, sendMessageToGemini } from './services/geminiService';
import { Smartphone, LayoutDashboard, Users, ChevronDown, Link2, Link2Off } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<CustomerData>(CUSTOMERS[0]);
  const [messages, setMessages] = useState<Message[]>(CUSTOMERS[0].messages);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  
  // Mode sinkronisasi dengan WhatsApp asli
  const [isLiveSync, setIsLiveSync] = useState(false);

  // Initialize Chat Session 
  useEffect(() => {
    initializeGeminiChat(data);
    setMessages(data.messages);
  }, [data]);

  // Fungsi helper agar AI menjawab pesan yang masuk dari WA
  const handleTriggerAIResponse = async (userText: string, customerId: string) => {
      setIsLoading(true);
      try {
        const responseText = await sendMessageToGemini(userText, customerId);
        
        // Tampilkan jawaban AI di UI
        const aiMsg: Message = { role: 'assistant', content: responseText };
        setMessages(prev => [...prev, aiMsg]);
        setData(prev => ({
            ...prev,
            messages: [...prev.messages, aiMsg]
        }));

        // KIRIM JAWABAN AI BALIK KE WA ASLI
        await fetch(`${API_BASE_URL}/api/send-message`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                customerId: customerId,
                message: responseText
            })
        });

      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  // =========================================================
  // LOGIC SINKRONISASI WA (POLLING)
  // =========================================================
  useEffect(() => {
    let intervalId: any;

    if (isLiveSync) {
      console.log(`Starting Live Sync with Backend at ${API_BASE_URL}...`);
      intervalId = setInterval(async () => {
        try {
          // Poll ke Backend: "Ada pesan baru dari HP +628123810892 gak?"
          const response = await fetch(`${API_BASE_URL}/api/poll-incoming`);
          const json = await response.json();

          if (json.hasNew && json.content) {
            console.log("New Message from WA:", json.content);
            const userMsg: Message = { role: 'user', content: json.content };
            
            // Tambahkan ke UI
            setMessages(prev => [...prev, userMsg]);
            
            // Update data customer state
            setData(prev => ({
               ...prev,
               messages: [...prev.messages, userMsg]
            }));

            // TRIGGER AI OTOMATIS MENJAWAB SETELAH MENERIMA PESAN WA
            handleTriggerAIResponse(json.content, data.id);
          }
        } catch (error) {
          console.warn("Polling failed. Is backend running?", error);
        }
      }, 3000); // Cek setiap 3 detik
    }

    return () => clearInterval(intervalId);
  }, [isLiveSync, data.id]);

  // =========================================================
  // HANDLE KIRIM PESAN (DARI UI)
  // =========================================================
  const handleSendMessage = async (text: string) => {
    if (isLiveSync) {
        // --- MODE LIVE (Kirim ke WA) ---
        const aiMsg: Message = { role: 'assistant', content: text };
        setMessages(prev => [...prev, aiMsg]);
        
        setIsLoading(true);
        try {
            // Kirim ke Backend -> Twilio
            await fetch(`${API_BASE_URL}/api/send-message`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    customerId: data.id,
                    message: text
                })
            });
        } catch (error) {
            console.error("Gagal kirim WA", error);
        } finally {
            setIsLoading(false);
        }

    } else {
        // --- MODE SIMULASI LOKAL (User vs AI) ---
        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setData(prev => ({ ...prev, messages: [...prev.messages, userMsg] }));

        setIsLoading(true);
        try {
          const responseText = await sendMessageToGemini(text, data.id);
          const aiMsg: Message = { role: 'assistant', content: responseText };
          setMessages(prev => [...prev, aiMsg]);
          setData(prev => ({ ...prev, messages: [...prev.messages, aiMsg] }));
        } catch (error) {
          console.error("Gemini Error", error);
        } finally {
          setIsLoading(false);
        }
    }
  };

  const handleSwitchCustomer = (customerId: string) => {
    const newCustomer = CUSTOMERS.find(c => c.id === customerId);
    if (newCustomer) {
      setData(newCustomer);
      setMessages(newCustomer.messages);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans overflow-hidden relative">
      
      {/* Top Control Bar */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 items-center">
        
        {/* Live Sync Toggle */}
        <button 
            onClick={() => setIsLiveSync(!isLiveSync)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-bold transition-all
            ${isLiveSync 
                ? 'bg-red-100 text-red-700 border-red-300 animate-pulse' 
                : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            title={isLiveSync ? "Terhubung ke WhatsApp +628123810892" : "Klik untuk hubungkan ke Backend"}
        >
            {isLiveSync ? <Link2 size={14} /> : <Link2Off size={14} />}
            {isLiveSync ? 'LIVE SYNC ON' : 'OFFLINE MODE'}
        </button>

        {/* Customer Selector */}
        <div className="relative group">
          <button className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50">
            <Users size={14} />
            <span>Ganti Peserta</span>
            <ChevronDown size={12} />
          </button>
          <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-1">
            {CUSTOMERS.map(c => (
              <button
                key={c.id}
                onClick={() => handleSwitchCustomer(c.id)}
                className={`w-full text-left px-4 py-3 text-xs border-b last:border-0 hover:bg-slate-50 ${data.id === c.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}
              >
                <div className="font-semibold mb-0.5">
                  {c.peserta_profile.gender === 'L' ? 'Bapak' : 'Ibu'} ({c.peserta_profile.status_kepesertaan})
                </div>
                <div className="text-[10px] opacity-70">
                   Tagihan: Rp{c.billing_info.total_tunggakan.toLocaleString('id-ID')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-white rounded-lg shadow-md border border-slate-200 p-1">
          <button 
            onClick={() => setViewMode('dashboard')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'dashboard' ? 'bg-bpjs-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
          <button 
            onClick={() => setViewMode('customer')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'customer' ? 'bg-bpjs-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Smartphone size={14} />
            Mobile View
          </button>
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        // === DASHBOARD VIEW ===
        <>
          <div className="w-1/3 min-w-[320px] max-w-[400px] h-full border-r border-slate-200 hidden md:block z-10">
            <CustomerPanel data={data} />
          </div>
          <div className="flex-1 h-full z-10">
            <ChatInterface 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
            {isLiveSync && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-3 py-1 rounded-full pointer-events-none">
                    Connected to: +628123810892
                </div>
            )}
          </div>
        </>
      ) : (
        // === CUSTOMER MOBILE VIEW ===
        <div className="w-full h-full flex items-center justify-center bg-slate-200 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
          <div className="w-full max-w-[380px] h-[90vh] bg-white rounded-[30px] shadow-2xl overflow-hidden border-[8px] border-slate-800 flex flex-col relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
            <div className="flex-1 overflow-hidden">
               <ChatInterface 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
              />
            </div>
            <div className="h-1 bg-slate-100 w-full flex justify-center pb-2">
               <div className="w-32 h-1 bg-slate-300 rounded-full mt-1"></div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default App;