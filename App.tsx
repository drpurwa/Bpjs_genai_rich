import React, { useState, useEffect, useRef } from 'react';
import { CustomerPanel } from './components/CustomerPanel';
import { ChatInterface } from './components/ChatInterface';
import { CUSTOMERS, API_BASE_URL } from './constants';
import { Message, CustomerData } from './types';
import { initializeGeminiChat, sendMessageToGemini } from './services/geminiService';
import { Smartphone, LayoutDashboard, Users, ChevronDown, Link2, Link2Off, Phone, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<CustomerData>(CUSTOMERS[0]);
  const [messages, setMessages] = useState<Message[]>(CUSTOMERS[0].messages);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  
  const [targetPhone, setTargetPhone] = useState(() => {
    return localStorage.getItem('target_phone') || '08123456789';
  });

  // State untuk Debug Status Webhook
  const [webhookStatus, setWebhookStatus] = useState<{lastTime: string | null, lastSender: string | null, rawBody?: any}>({ lastTime: null, lastSender: null });

  useEffect(() => {
    localStorage.setItem('target_phone', targetPhone);
  }, [targetPhone]);

  const [isLiveSync, setIsLiveSync] = useState(false);

  const dataRef = useRef(data);
  const messagesRef = useRef(messages);
  const targetPhoneRef = useRef(targetPhone);
  
  useEffect(() => {
    dataRef.current = data;
    messagesRef.current = messages;
    targetPhoneRef.current = targetPhone;
  }, [data, messages, targetPhone]);

  useEffect(() => {
    initializeGeminiChat(data);
    setMessages(data.messages);
  }, [data.id]);

  // =========================================================
  // LOGIC SINKRONISASI WA (POLLING)
  // =========================================================
  useEffect(() => {
    let intervalId: any;
    let debugIntervalId: any;

    const processIncomingMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/poll-incoming`);
        const json = await response.json();

        if (json.hasNew && json.messages && json.messages.length > 0) {
            console.log(`📥 Received ${json.messages.length} new messages from WA`);
            
            for (const msg of json.messages) {
                const userText = msg.content;
                const sender = msg.sender;
                
                // Tambahkan pesan user ke UI
                const userMsg: Message = { role: 'user', content: userText };

                setMessages(prev => [...prev, userMsg]);
                setData(prev => ({
                    ...prev,
                    messages: [...prev.messages, userMsg]
                }));
                
                messagesRef.current = [...messagesRef.current, userMsg];

                // TRIGGER AI SEGERA
                setIsLoading(true);
                try {
                    const currentId = dataRef.current.id;
                    const responseText = await sendMessageToGemini(userText, currentId);
                    const aiMsg: Message = { role: 'assistant', content: responseText };

                    setMessages(prev => [...prev, aiMsg]);
                    setData(prev => ({
                        ...prev,
                        messages: [...prev.messages, aiMsg]
                    }));

                    // Kirim Balasan ke Nomor Pengirim Asli
                    const replyTarget = sender || targetPhoneRef.current;

                    await fetch(`${API_BASE_URL}/api/send-message`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            customerId: currentId,
                            message: responseText,
                            target: replyTarget 
                        })
                    });

                } catch (err) {
                    console.error("Error processing auto-reply:", err);
                } finally {
                    setIsLoading(false);
                }
            }
        }
      } catch (error) {
         // silent error
      }
    };

    // Fungsi Debugging Terpisah
    const checkWebhookStatus = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/debug`);
            const json = await res.json();
            if (json.receivedAt) {
                setWebhookStatus({
                    lastTime: json.receivedAt,
                    lastSender: json.sender,
                    rawBody: json.rawBody
                });
            }
        } catch (e) {
            console.error("Debug fetch failed");
        }
    }

    if (isLiveSync) {
      intervalId = setInterval(processIncomingMessages, 3000); 
      // Cek status webhook tiap 5 detik untuk update UI debug
      debugIntervalId = setInterval(checkWebhookStatus, 5000);
      checkWebhookStatus(); // first run
    }

    return () => {
        clearInterval(intervalId);
        clearInterval(debugIntervalId);
    };
  }, [isLiveSync]); 

  const handleSendMessage = async (text: string) => {
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
      <div className="absolute top-4 right-4 z-50 flex gap-2 items-start flex-wrap justify-end pl-4 pointer-events-auto">
        
        {/* Target Phone Input */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 h-[34px]" title="Nomor HP Tujuan">
           <Phone size={14} className="text-slate-400" />
           <input 
              type="text" 
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              className="w-28 text-xs font-mono outline-none text-slate-700 placeholder-slate-300"
              placeholder="0812..."
           />
        </div>

        {/* Live Sync Toggle & Debug Info */}
        <div className="flex flex-col items-end gap-1">
            <button 
                onClick={() => setIsLiveSync(!isLiveSync)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-bold transition-all h-[34px]
                ${isLiveSync 
                    ? 'bg-red-600 text-white border-red-700 animate-pulse ring-2 ring-red-200' 
                    : 'bg-white text-slate-500 hover:bg-slate-50'}`}
            >
                {isLiveSync ? <Link2 size={14} /> : <Link2Off size={14} />}
                {isLiveSync ? 'LIVE SYNC: ON' : 'LIVE SYNC: OFF'}
            </button>
            
            {/* DEBUG INFO: Tampil hanya jika Live Sync ON */}
            {isLiveSync && (
                <div className="bg-slate-800 text-white text-[10px] px-3 py-2 rounded opacity-95 backdrop-blur-sm border border-slate-600 flex flex-col items-start w-64 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                    <div className="flex items-center gap-1 mb-1 border-b border-slate-600 w-full pb-1">
                        <Activity size={10} className={webhookStatus.lastTime ? "text-green-400" : "text-slate-400"} />
                        <span className="font-semibold">Server Webhook Monitor</span>
                    </div>
                    {webhookStatus.lastTime ? (
                        <>
                            <span className="text-green-300 block">Received: {webhookStatus.lastTime}</span>
                            <span className="text-slate-300 block mb-1">From: {webhookStatus.lastSender}</span>
                            {webhookStatus.rawBody && (
                                <details className="w-full">
                                    <summary className="cursor-pointer text-blue-300 hover:text-blue-200">Show Raw JSON</summary>
                                    <pre className="text-[9px] text-slate-400 bg-slate-900 p-1 rounded mt-1 overflow-x-auto">
                                        {JSON.stringify(webhookStatus.rawBody, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </>
                    ) : (
                        <div className="text-red-300 italic text-center w-full py-2">
                           Waiting for data... <br/>
                           <span className="text-[9px] text-slate-400 not-italic">
                             Pastikan URL di Fonnte: <br/>
                             [domain]/whatsapp
                           </span>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Customer Selector */}
        <div className="relative group h-[34px]">
          <button className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 h-full">
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

        {/* View Mode */}
        <div className="flex bg-white rounded-lg shadow-md border border-slate-200 p-1 h-[34px] items-center">
          <button 
            onClick={() => setViewMode('dashboard')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'dashboard' ? 'bg-bpjs-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={14} />
          </button>
          <button 
            onClick={() => setViewMode('customer')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'customer' ? 'bg-bpjs-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        // === DASHBOARD VIEW ===
        <>
          <div className="w-1/3 min-w-[320px] max-w-[400px] h-full border-r border-slate-200 hidden md:block z-10">
            <CustomerPanel data={data} targetPhone={targetPhone} />
          </div>
          <div className="flex-1 h-full z-10">
            <ChatInterface 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading}
              isReadOnly={isLiveSync} 
            />
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
                isReadOnly={isLiveSync}
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