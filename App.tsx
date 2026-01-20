import React, { useState, useEffect, useRef } from 'react';
import { CustomerPanel } from './components/CustomerPanel';
import { ChatInterface } from './components/ChatInterface';
import { CUSTOMERS, API_BASE_URL } from './constants';
import { Message, CustomerData } from './types';
import { initializeGeminiChat, sendMessageToGemini } from './services/geminiService';
import { Smartphone, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<CustomerData>(CUSTOMERS[0]);
  const [messages, setMessages] = useState<Message[]>(CUSTOMERS[0].messages);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  
  const [targetPhone, setTargetPhone] = useState(() => {
    return localStorage.getItem('target_phone') || '123456789'; // Default ID dummy Telegram
  });

  const [telegramToken, setTelegramToken] = useState(() => {
    return localStorage.getItem('telegram_bot_token') || '';
  });

  // State Debugging
  const [webhookStatus, setWebhookStatus] = useState<{lastTime: string | null, lastSender: string | null, rawBody?: any}>({ lastTime: null, lastSender: null });
  const [backendConnection, setBackendConnection] = useState<'checking' | 'connected' | 'error'>('checking');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    localStorage.setItem('target_phone', targetPhone);
  }, [targetPhone]);

  useEffect(() => {
    localStorage.setItem('telegram_bot_token', telegramToken);
  }, [telegramToken]);

  const [isLiveSync, setIsLiveSync] = useState(false);

  const dataRef = useRef(data);
  const messagesRef = useRef(messages);
  const targetPhoneRef = useRef(targetPhone);
  const telegramTokenRef = useRef(telegramToken);
  
  useEffect(() => {
    dataRef.current = data;
    messagesRef.current = messages;
    targetPhoneRef.current = targetPhone;
    telegramTokenRef.current = telegramToken;
  }, [data, messages, targetPhone, telegramToken]);

  useEffect(() => {
    initializeGeminiChat(data);
    setMessages(data.messages);
  }, [data.id]);

  // =========================================================
  // LOGIC SINKRONISASI TELEGRAM (POLLING)
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
            console.log(`📥 Received ${json.messages.length} new messages from Telegram`);
            
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
                    const token = telegramTokenRef.current;

                    await fetch(`${API_BASE_URL}/api/send-message`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            customerId: currentId,
                            message: responseText,
                            target: replyTarget,
                            token: token
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

  // New Function: Simulate Incoming Webhook (Telegram Format)
  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
        // Simulasi Format Telegram Bot API Update
        const telegramPayload = {
            update_id: 123456789,
            message: {
                message_id: 555,
                from: {
                    id: 987654321,
                    is_bot: false,
                    first_name: "Simulated User",
                    username: "sim_user"
                },
                chat: {
                    id: 987654321,
                    first_name: "Simulated User",
                    username: "sim_user",
                    type: "private"
                },
                date: 16788888,
                text: "Halo, ini pesan test simulasi Format Telegram!"
            }
        };

        const res = await fetch(`${API_BASE_URL}/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telegramPayload)
        });
        
        if (res.ok) {
            alert("Simulasi Telegram Terkirim! Cek indikator status sebentar lagi.");
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
      
      {/* Top Control Bar - Minimalist View Toggle Only */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 items-start flex-wrap justify-end pl-4 pointer-events-auto">
        {/* View Mode */}
        <div className="flex bg-white rounded-lg shadow-md border border-slate-200 p-1 h-[34px] items-center">
          <button 
            onClick={() => setViewMode('dashboard')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'dashboard' ? 'bg-bpjs-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            title="Dashboard View"
          >
            <LayoutDashboard size={14} />
          </button>
          <button 
            onClick={() => setViewMode('customer')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-2 transition-colors ${viewMode === 'customer' ? 'bg-bpjs-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            title="Customer View Simulation"
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        // === DASHBOARD VIEW ===
        <>
          <div className="w-1/3 min-w-[320px] max-w-[400px] h-full border-r border-slate-200 hidden md:block z-10">
            <CustomerPanel 
                data={data} 
                targetPhone={targetPhone}
                setTargetPhone={setTargetPhone}
                telegramToken={telegramToken}
                setTelegramToken={setTelegramToken}
                isLiveSync={isLiveSync}
                setIsLiveSync={setIsLiveSync}
                webhookStatus={webhookStatus}
                backendConnection={backendConnection}
                simulating={simulating}
                onSimulateWebhook={handleSimulateWebhook}
                onSwitchCustomer={handleSwitchCustomer}
            />
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