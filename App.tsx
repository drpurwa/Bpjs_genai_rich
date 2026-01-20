import React, { useState, useEffect, useRef } from 'react';
import { CustomerPanel } from './components/CustomerPanel';
import { ChatInterface } from './components/ChatInterface';
import { CUSTOMERS, API_BASE_URL } from './constants';
import { Message, CustomerData } from './types';
import { initializeGeminiChat, sendMessageToGemini } from './services/geminiService';
import { Smartphone, LayoutDashboard, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<CustomerData>(CUSTOMERS[0]);
  const [messages, setMessages] = useState<Message[]>(CUSTOMERS[0].messages);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  
  // Default Values updated per user request
  const [targetPhone, setTargetPhone] = useState(() => {
    return localStorage.getItem('target_phone') || '628123810892'; 
  });

  const [whatsappToken, setWhatsappToken] = useState(() => {
    return localStorage.getItem('whatsapp_token') || 'EAAeJN4fTa0QBQimXHdkM4fgeetIZCqiZABSXZB1nGc9ohnTM0txdhPECW9TyWDC9UCpmLBqiLQZCjg6l75SZANiwD9zocb6ZAgbz2xvbpX4msZARfEPHsiDiE6GMHVvwTcrLbL8hd9nGtV4T9uEYqb76eRV0vOVb5On6FTRWP04hYkl4RfWdiMH9Xvz4Ocyckq1wwjKppxmNDTiSKAsjd3w5tBZCvRYXsjIE9ZAdt';
  });

  const [phoneId, setPhoneId] = useState(() => {
    return localStorage.getItem('whatsapp_phone_id') || '889407650931797';
  });

  // State Debugging
  const [webhookStatus, setWebhookStatus] = useState<{lastTime: string | null, lastSender: string | null, rawBody?: any}>({ lastTime: null, lastSender: null });
  const [backendConnection, setBackendConnection] = useState<'checking' | 'connected' | 'error'>('checking');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    localStorage.setItem('target_phone', targetPhone);
  }, [targetPhone]);

  useEffect(() => {
    localStorage.setItem('whatsapp_token', whatsappToken);
  }, [whatsappToken]);

  useEffect(() => {
    localStorage.setItem('whatsapp_phone_id', phoneId);
  }, [phoneId]);

  const [isLiveSync, setIsLiveSync] = useState(false);

  const dataRef = useRef(data);
  const messagesRef = useRef(messages);
  const targetPhoneRef = useRef(targetPhone);
  const whatsappTokenRef = useRef(whatsappToken);
  const phoneIdRef = useRef(phoneId);
  
  useEffect(() => {
    dataRef.current = data;
    messagesRef.current = messages;
    targetPhoneRef.current = targetPhone;
    whatsappTokenRef.current = whatsappToken;
    phoneIdRef.current = phoneId;
  }, [data, messages, targetPhone, whatsappToken, phoneId]);

  useEffect(() => {
    initializeGeminiChat(data);
    setMessages(data.messages);
  }, [data.id]);

  // Check Backend Connection on Mount
  useEffect(() => {
    const checkBackend = async () => {
        try {
            const res = await fetch(API_BASE_URL);
            if (res.ok) {
                setBackendConnection('connected');
            } else {
                setBackendConnection('error');
            }
        } catch (e) {
            setBackendConnection('error');
        }
    };
    checkBackend();
  }, []);

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
                    const token = whatsappTokenRef.current;
                    const pId = phoneIdRef.current;

                    await fetch(`${API_BASE_URL}/api/send-message`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            customerId: currentId,
                            message: responseText,
                            target: replyTarget,
                            token: token,
                            phoneId: pId,
                            isTemplate: false // Reply selalu text biasa
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
    }

    return () => {
        clearInterval(intervalId);
        clearInterval(debugIntervalId);
    };
  }, [isLiveSync]); 

  // New Function: Simulate Incoming Webhook (WA Format)
  const handleSimulateWebhook = async () => {
    setSimulating(true);
    // Use target phone if available, else fallback to a dummy, 
    // BUT we want to use target phone so the reply goes to the real device.
    const simTarget = targetPhone || "628123456789"; 

    try {
        // Simulasi Format WhatsApp Cloud API
        const waPayload = {
            object: "whatsapp_business_account",
            entry: [{
                id: "123456789",
                changes: [{
                    value: {
                        messaging_product: "whatsapp",
                        metadata: {
                            display_phone_number: "1234567890",
                            phone_number_id: "1234567890"
                        },
                        contacts: [{
                            profile: { name: "Simulated User" },
                            wa_id: simTarget
                        }],
                        messages: [{
                            from: simTarget,
                            id: "wamid.HBgL..." + Date.now(),
                            timestamp: Date.now() / 1000,
                            text: { body: "Halo, ini pesan test simulasi WA!" },
                            type: "text"
                        }]
                    },
                    field: "messages"
                }]
            }]
        };

        const res = await fetch(`${API_BASE_URL}/webhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(waPayload)
        });
        
        if (res.ok) {
            alert(`Simulasi Masuk!\n\nPesan simulasi telah dikirim ke backend seolah-olah dari nomor: ${simTarget}.\n\nBackend akan membalas via AI ke nomor WA tersebut.`);
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
      
      {/* Backend Error Banner */}
      {backendConnection === 'error' && (
        <div className="w-full bg-red-600 text-white text-[10px] py-1.5 px-4 text-center font-bold absolute top-0 z-[60] flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top-full duration-500">
           <WifiOff size={12} />
           <span>Gagal menghubungi backend. Pastikan server Railway/Localhost aktif.</span>
        </div>
      )}

      {/* Top Control Bar - Minimalist View Toggle Only */}
      <div className={`absolute top-4 right-4 z-50 flex gap-2 items-start flex-wrap justify-end pl-4 pointer-events-auto transition-all ${backendConnection === 'error' ? 'mt-6' : ''}`}>
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
          <div className="w-1/3 min-w-[320px] max-w-[400px] h-full border-r border-slate-200 hidden md:block z-10 pt-6">
            <CustomerPanel 
                data={data} 
                targetPhone={targetPhone}
                setTargetPhone={setTargetPhone}
                whatsappToken={whatsappToken}
                setWhatsappToken={setWhatsappToken}
                phoneId={phoneId}
                setPhoneId={setPhoneId}
                isLiveSync={isLiveSync}
                setIsLiveSync={setIsLiveSync}
                webhookStatus={webhookStatus}
                backendConnection={backendConnection}
                simulating={simulating}
                onSimulateWebhook={handleSimulateWebhook}
                onSwitchCustomer={handleSwitchCustomer}
            />
          </div>
          <div className="flex-1 h-full z-10 pt-6">
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
        <div className="w-full h-full flex items-center justify-center bg-slate-200 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] pt-6">
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