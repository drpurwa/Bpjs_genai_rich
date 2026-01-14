import React, { useState, useEffect, useRef } from 'react';
import { CustomerPanel } from './components/CustomerPanel';
import { ChatInterface } from './components/ChatInterface';
import { CUSTOMERS, API_BASE_URL } from './constants';
import { Message, CustomerData } from './types';
import { initializeGeminiChat, sendMessageToGemini } from './services/geminiService';
import { Smartphone, LayoutDashboard, Users, ChevronDown, Link2, Link2Off, Phone, Activity, Wifi, WifiOff, PlayCircle, Copy, ArrowUpRight, ArrowDownLeft, Radio, Info } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<CustomerData>(CUSTOMERS[0]);
  const [messages, setMessages] = useState<Message[]>(CUSTOMERS[0].messages);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  
  const [targetPhone, setTargetPhone] = useState(() => {
    return localStorage.getItem('target_phone') || '08123810892';
  });

  // State Debugging
  const [webhookStatus, setWebhookStatus] = useState<{lastTime: string | null, lastSender: string | null, rawBody?: any}>({ lastTime: null, lastSender: null });
  const [backendConnection, setBackendConnection] = useState<'checking' | 'connected' | 'error'>('checking');
  const [simulating, setSimulating] = useState(false);

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
        
        // Update connection status
        setBackendConnection('connected');

        const json = await response.json();

        if (json.hasNew && json.messages && json.messages.length > 0) {
            console.log(`📥 Received ${json.messages.length} new messages from WA`);
            
            for (const msg of json.messages) {
                const userText = msg.content;
                const sender = msg.sender;
                
                const userMsg: Message = { role: 'user', content: userText };

                setMessages(prev => [...prev, userMsg]);
                setData(prev => ({
                    ...prev,
                    messages: [...prev.messages, userMsg]
                }));
                
                messagesRef.current = [...messagesRef.current, userMsg];

                // TRIGGER AI
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
         setBackendConnection('error');
      }
    };

    const checkWebhookStatus = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/debug`);
            if (res.ok) {
                const json = await res.json();
                if (json.receivedAt) {
                    setWebhookStatus({
                        lastTime: json.receivedAt,
                        lastSender: json.sender,
                        rawBody: json.rawBody
                    });
                }
            }
        } catch (e) {
            console.error("Debug fetch failed");
        }
    }

    if (isLiveSync) {
      intervalId = setInterval(processIncomingMessages, 3000); 
      debugIntervalId = setInterval(checkWebhookStatus, 5000);
      checkWebhookStatus(); 
      // Initial ping check
      fetch(API_BASE_URL).then(r => r.ok ? setBackendConnection('connected') : setBackendConnection('error')).catch(() => setBackendConnection('error'));
    }

    return () => {
        clearInterval(intervalId);
        clearInterval(debugIntervalId);
    };
  }, [isLiveSync]); 

  // New Function: Simulate Incoming Webhook
  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
        // Kita tembak langsung endpoint /whatsapp di backend sendiri
        // Seolah-olah kita adalah Fonnte
        const res = await fetch(`${API_BASE_URL}/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender: '628999999999',
                message: 'Halo, ini pesan test simulasi dari Dashboard!',
                api_key: 'test-simulation',
                id: 'SIMULATED_INBOX_ID_123'
            })
        });
        
        if (res.ok) {
            alert("Simulasi Terkirim! Cek indikator status sebentar lagi.");
        } else {
            alert("Gagal kirim simulasi. Backend error.");
        }
    } catch (e) {
        alert("Gagal menghubungi backend untuk simulasi.");
    } finally {
        setSimulating(false);
    }
  };

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
                <div className="bg-slate-800 text-white text-[10px] px-3 py-2 rounded opacity-95 backdrop-blur-sm border border-slate-600 flex flex-col items-start w-80 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 shadow-xl">
                    
                    {/* WEBHOOK CONFIG HELPER */}
                    <div className="w-full bg-blue-900/50 p-2 rounded mb-2 border border-blue-700">
                        <span className="text-blue-300 font-bold block mb-1">⚠️ WAJIB Setting di Fonnte:</span>
                        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded">
                            <code className="text-[9px] text-slate-300 break-all flex-1">
                                {API_BASE_URL}/whatsapp
                            </code>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`${API_BASE_URL}/whatsapp`);
                                    alert("URL Copied! Paste di Menu Webhook Fonnte.");
                                }}
                                className="text-blue-400 hover:text-white"
                                title="Copy URL"
                            >
                                <Copy size={12} />
                            </button>
                        </div>
                    </div>

                    {/* CONNECTION HEALTH CHECK */}
                    <div className="flex items-center gap-2 mb-2 border-b border-slate-600 w-full pb-1">
                        {backendConnection === 'connected' ? <Wifi size={12} className="text-green-400"/> : <WifiOff size={12} className="text-red-400"/>}
                        <span className={backendConnection === 'connected' ? "text-green-300" : "text-red-300 font-bold"}>
                            {backendConnection === 'checking' ? "Connecting..." : 
                             backendConnection === 'connected' ? "Backend Connected" : "Backend Disconnected"}
                        </span>
                    </div>

                    {/* JALUR KIRIM STATUS */}
                    <div className="flex items-center justify-between w-full mb-1 p-1 bg-slate-700/50 rounded border-l-2 border-green-500">
                        <div className="flex items-center gap-1.5">
                            <ArrowUpRight size={10} className="text-green-400" />
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-200">Jalur Kirim (Outgoing)</span>
                                <span className="text-[8px] text-slate-400">Metode: API (Aktif)</span>
                            </div>
                        </div>
                        <span className="text-green-300 font-bold text-[9px]">ACTIVE ✅</span>
                    </div>

                    {/* JALUR TERIMA STATUS */}
                    <div className={`flex flex-col w-full mb-1 p-1 bg-slate-700/50 rounded border-l-2 ${webhookStatus.lastTime ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1.5">
                                <ArrowDownLeft size={10} className={webhookStatus.lastTime ? "text-green-400" : "text-red-400"} />
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-200">Jalur Terima (Incoming)</span>
                                    <span className="text-[8px] text-slate-400">Metode: Webhook (Real-time)</span>
                                </div>
                            </div>
                            <span className={`font-bold text-[9px] ${webhookStatus.lastTime ? 'text-green-300' : 'text-red-300'}`}>
                                {webhookStatus.lastTime ? 'ACTIVE ✅' : 'WAITING ⏳'}
                            </span>
                        </div>
                        
                        {/* EDUKASI KENAPA WEBHOOK */}
                        {!webhookStatus.lastTime && (
                           <div className="mt-1 pt-1 border-t border-slate-600 text-[9px] text-slate-400 italic">
                              <div className="flex gap-1">
                                 <Info size={10} className="shrink-0 mt-0.5" />
                                 <span>
                                    Kenapa tidak pakai API Polling? Karena Webhook lebih cepat (real-time) dan tidak membebani server Fonnte.
                                 </span>
                              </div>
                           </div>
                        )}

                        {webhookStatus.lastTime && (
                           <div className="mt-1 pt-1 border-t border-slate-600">
                              <span className="text-green-300 block">Recv: {webhookStatus.lastTime}</span>
                              <span className="text-slate-300 block">From: {webhookStatus.lastSender}</span>
                           </div>
                        )}
                    </div>
                    
                    {/* VISUALISASI ALUR */}
                    <div className="w-full bg-black/20 p-2 rounded mt-1 border border-slate-700">
                        <span className="text-[9px] text-slate-400 block mb-1 font-semibold text-center">ALUR DATA (PUSH MECHANISM)</span>
                        <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
                           <div className="flex flex-col items-center">
                              <span className="bg-green-800 px-1 rounded">WA</span>
                              <span className="text-[8px] mt-0.5">User</span>
                           </div>
                           <span className="text-slate-500">➜</span>
                           <div className="flex flex-col items-center">
                              <span className="bg-blue-800 px-1 rounded">Fonnte</span>
                              <span className="text-[8px] mt-0.5">Server</span>
                           </div>
                           <div className="flex flex-col items-center gap-0">
                               <span className="text-[8px] text-yellow-400 animate-pulse">Push</span>
                               <span className="text-[8px] text-slate-500">➜</span>
                           </div>
                           <div className="flex flex-col items-center">
                              <span className="bg-purple-800 px-1 rounded">Railway</span>
                              <span className="text-[8px] mt-0.5">Backend</span>
                           </div>
                        </div>
                    </div>

                    {/* SIMULATION BUTTON */}
                    {!webhookStatus.lastTime && (
                         <div className="w-full flex justify-end mt-2">
                            <button 
                                onClick={handleSimulateWebhook}
                                disabled={simulating || backendConnection !== 'connected'}
                                className="text-[9px] bg-slate-600 hover:bg-slate-500 border border-slate-500 px-2 py-1.5 rounded flex items-center gap-1 disabled:opacity-50 text-white w-full justify-center"
                            >
                                <PlayCircle size={10} /> 
                                {simulating ? 'Mengirim Simulasi...' : 'Test Simulasi Webhook (Paksa Masuk)'}
                            </button>
                        </div>
                    )}

                    {backendConnection === 'error' && (
                         <div className="text-red-300 bg-red-900/30 p-1 rounded mt-2 text-[9px] w-full border border-red-800">
                            <strong>FATAL:</strong> Frontend Putus Koneksi ke Backend.
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