import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { CustomerPanel } from './components/CustomerPanel';
import { ChatInterface } from './components/ChatInterface';
import { INITIAL_CUSTOMER_DATA, API_BASE_URL } from './constants'; 
import { Message, CustomerData } from './types';
import { callGeminiBackend } from './services/geminiService';
import { Smartphone, LayoutDashboard, WifiOff, Loader2 } from 'lucide-react'; 

const App: React.FC = () => {
  const [customerStates, setCustomerStates] = useState<CustomerData[]>([]);
  const [activeCustomerId, setActiveCustomerId] = useState<string>('');
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(false); // Untuk indikator AI sedang mengetik
  const [viewMode, setViewMode] = useState<'dashboard' | 'customer'>('dashboard');
  
  const [targetPhone, setTargetPhone] = useState(() => {
    return localStorage.getItem('target_phone') || '6282111164113'; // Default ke nomor CUSTOMER_1
  });

  const [whatsappToken, setWhatsappToken] = useState(() => {
    return localStorage.getItem('whatsapp_token') || ''; // Kosongkan, wajib diisi
  });

  const [phoneId, setPhoneId] = useState(() => {
    return localStorage.getItem('whatsapp_phone_id') || ''; // Kosongkan, wajib diisi
  });

  const [webhookStatus, setWebhookStatus] = useState<{lastTime: string | null, lastSender: string | null, rawBody?: any}>({ lastTime: null, lastSender: null });
  const [backendConnection, setBackendConnection] = useState<'checking' | 'connected' | 'error'>('checking');
  const [simulating, setSimulating] = useState(false);
  const [isLiveSync, setIsLiveSync] = useState(false); // Mode tampilan sinkronisasi aktif

  // Refs untuk mengakses state terbaru di dalam closures setInterval
  const customerStatesRef = useRef(customerStates);
  const activeCustomerIdRef = useRef(activeCustomerId); // Ref untuk activeCustomerId
  const targetPhoneRef = useRef(targetPhone);
  const whatsappTokenRef = useRef(whatsappToken);
  const phoneIdRef = useRef(phoneId);
  
  // Update refs when state changes
  useEffect(() => {
    customerStatesRef.current = customerStates;
    activeCustomerIdRef.current = activeCustomerId;
    targetPhoneRef.current = targetPhone;
    whatsappTokenRef.current = whatsappToken;
    phoneIdRef.current = phoneId;
  }, [customerStates, activeCustomerId, targetPhone, whatsappToken, phoneId]);


  // Effect untuk menyimpan ke localStorage
  useEffect(() => { localStorage.setItem('target_phone', targetPhone); }, [targetPhone]);
  useEffect(() => { localStorage.setItem('whatsapp_token', whatsappToken); }, [whatsappToken]);
  useEffect(() => { localStorage.setItem('whatsapp_phone_id', phoneId); }, [phoneId]);

  // Initial fetch customer data from backend on mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      setIsDataLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/customers`);
        if (!response.ok) {
          throw new Error('Failed to fetch customer data from backend');
        }
        const data: CustomerData[] = await response.json();
        setCustomerStates(data);
        if (data.length > 0) {
          setActiveCustomerId(data[0].id); // Set pelanggan pertama sebagai aktif secara default
        }
        setBackendConnection('connected'); // Jika fetch data berhasil, berarti backend connected
      } catch (error) {
        console.error("Error fetching customer data:", error);
        setCustomerStates([INITIAL_CUSTOMER_DATA as CustomerData]); // Fallback ke placeholder jika gagal
        setActiveCustomerId(INITIAL_CUSTOMER_DATA.id);
        setBackendConnection('error'); // Set koneksi backend error
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchCustomerData();
  }, []); // Hanya berjalan sekali saat komponen di-mount

  // Data pelanggan aktif dan pesan aktif, diturunkan dari customerStates dan activeCustomerId
  const activeCustomerData = useMemo(() => {
    return customerStates.find(c => c.id === activeCustomerId) || INITIAL_CUSTOMER_DATA as CustomerData;
  }, [customerStates, activeCustomerId]);

  const activeCustomerMessages = activeCustomerData.messages;

  // Extracted checkWebhookStatus function
  // @google/genai-fix: Move `checkWebhookStatus` outside `useEffect` and wrap it in `useCallback` to make it reusable.
  const checkWebhookStatus = useCallback(async () => {
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
        console.error("Debug fetch failed", e);
    }
  }, []); // No dependencies as it uses `setWebhookStatus` which is stable, and `API_BASE_URL` from module scope.


  // Polling untuk update data pelanggan dari backend (saat isLiveSync aktif)
  useEffect(() => {
    // @google/genai-fix: Use 'number' instead of 'NodeJS.Timeout' for browser timer IDs.
    let intervalId: number | undefined;
    // @google/genai-fix: Use 'number' instead of 'NodeJS.Timeout' for browser timer IDs.
    let debugIntervalId: number | undefined;

    const pollLatestCustomerData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/customers`);
        if (response.ok) {
          const data: CustomerData[] = await response.json();
          setCustomerStates(data);
          // Ensure activeCustomerId is still valid, or default to the first customer
          if (!activeCustomerIdRef.current || !data.some(c => c.id === activeCustomerIdRef.current)) {
              if (data.length > 0) {
                  setActiveCustomerId(data[0].id);
              } else {
                  setActiveCustomerId(INITIAL_CUSTOMER_DATA.id);
              }
          }
          setBackendConnection('connected');
        } else {
          setBackendConnection('error');
        }
      } catch (e) {
        setBackendConnection('error');
      }
    };

    if (isLiveSync) {
      // Poll customer data every 3 seconds to reflect backend updates
      intervalId = setInterval(pollLatestCustomerData, 3000); 
      debugIntervalId = setInterval(checkWebhookStatus, 5000); // Use the memoized function
      pollLatestCustomerData(); // Run immediately
      checkWebhookStatus(); // Run immediately
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (debugIntervalId) clearInterval(debugIntervalId);
    };
  }, [isLiveSync, activeCustomerId, checkWebhookStatus]); // Re-run effect if isLiveSync, activeCustomerId, or checkWebhookStatus changes


  // Fungsi kirim pesan dari UI (manual), akan memanggil backend untuk proses AI
  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text };
    
    // Optimistic UI update
    let currentCustomerMessages = [...activeCustomerData.messages, userMsg];
    setCustomerStates(prevStates => {
      const customerIndex = prevStates.findIndex(c => c.id === activeCustomerIdRef.current);
      if (customerIndex === -1) return prevStates;
      const updatedCustomer = { ...prevStates[customerIndex], messages: currentCustomerMessages };
      const newStates = [...prevStates];
      newStates[customerIndex] = updatedCustomer;
      return newStates;
    });

    setIsLoading(true); // Tampilkan indikator loading

    try {
      // Panggil backend, backend akan memproses AI, menyimpan riwayat, dan membalas WA
      const responseText = await callGeminiBackend(
        text, 
        { ...activeCustomerData, messages: currentCustomerMessages }, // Kirim state chat terbaru
        targetPhoneRef.current,
        whatsappTokenRef.current,
        phoneIdRef.current
      );
      
      // Setelah backend merespon, update state lagi dengan balasan AI dari backend
      // Ini juga akan di-handle oleh polling, tapi kita bisa update langsung untuk responsifitas
      const aiMsg: Message = { role: 'assistant', content: responseText };
       setCustomerStates(prevStates => {
        const customerIndex = prevStates.findIndex(c => c.id === activeCustomerIdRef.current);
        if (customerIndex === -1) return prevStates;
        const updatedCustomer = { 
            ...prevStates[customerIndex], 
            messages: [...currentCustomerMessages, aiMsg] // Gabungkan pesan user dan AI
        };
        const newStates = [...prevStates];
        newStates[customerIndex] = updatedCustomer;
        return newStates;
      });

    } catch (error) {
      console.error("Gemini Error (manual send from frontend):", error);
      // Fallback response for UI if AI fails
      const fallbackMsg: Message = { role: 'assistant', content: "Maaf, terjadi kesalahan saat memproses pesan Anda. Mohon coba lagi." };
      setCustomerStates(prevStates => {
        const customerIndex = prevStates.findIndex(c => c.id === activeCustomerIdRef.current);
        if (customerIndex === -1) return prevStates;
        const updatedCustomer = { 
            ...prevStates[customerIndex], 
            messages: [...currentCustomerMessages, fallbackMsg] 
        };
        const newStates = [...prevStates];
        newStates[customerIndex] = updatedCustomer;
        return newStates;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to simulate an incoming WhatsApp webhook message
  const handleSimulateWebhook = async () => {
    setSimulating(true);
    try {
      const samplePayload = {
        "object": "whatsapp_business_account",
        "entry": [
          {
            "id": "1430450225258870", // Dummy WABA ID
            "changes": [
              {
                "value": {
                  "messaging_product": "whatsapp",
                  "metadata": {
                    "display_phone_number": "15551841728", // Dummy display phone number
                    "phone_number_id": phoneIdRef.current || "889407650931797" // Use current phoneId
                  },
                  "contacts": [
                    {
                      "profile": { "name": "Simulated User" },
                      "wa_id": targetPhoneRef.current // Use current targetPhone as sender
                    }
                  ],
                    "messages": [
                      {
                        "from": targetPhoneRef.current, // Message from targetPhone
                        "id": "wamid.Simulate" + Date.now(),
                        "timestamp": Math.floor(Date.now() / 1000).toString(),
                        "text": { "body": "Tes pesan simulasi dari dashboard." },
                        "type": "text"
                      }
                    ]
                },
                "field": "messages"
              }
            ]
          }
        ]
      };

      const response = await fetch(`${API_BASE_URL}/api/simulate-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(samplePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Simulation failed:', errorData);
        alert('Simulasi Gagal: ' + (errorData.reason || 'Unknown error'));
      } else {
        alert('Simulasi Sukses! Cek di chat interface.');
        // After successful simulation, force a poll to get the latest data
        if (isLiveSync) {
            // In live sync mode, the polling interval will eventually update customer data.
            // But we should immediately update webhookStatus to reflect the simulation.
            checkWebhookStatus(); // This will update global.lastWebhookData on backend and webhookStatus state on frontend.
        } else {
            // If not in live sync, we need to manually fetch updated customer data
            const updatedResponse = await fetch(`${API_BASE_URL}/api/customers`);
            if (updatedResponse.ok) {
                const data: CustomerData[] = await updatedResponse.json();
                setCustomerStates(data);

                // Fetch debug info to get the customerId used by the backend for the simulation
                const debugResponse = await fetch(`${API_BASE_URL}/api/debug`);
                if (debugResponse.ok) {
                    const debugData = await debugResponse.json();
                    if (debugData.customerId) {
                        setActiveCustomerId(debugData.customerId);
                    } else {
                        console.warn("Backend debug info did not provide customerId after simulation.");
                    }
                    // Always update webhookStatus even if not in live sync mode for consistency
                    checkWebhookStatus(); // Use the memoized function
                } else {
                    console.warn("Failed to fetch debug info from backend after simulation.");
                }
            }
        }
      }
    } catch (error) {
      console.error('Network error during simulation:', error);
      alert('Network Error: Gagal menghubungi backend.');
    } finally {
      setSimulating(false);
    }
  };

  // Fungsi ganti pelanggan (dari dropdown)
  const handleSwitchCustomer = (customerId: string) => {
    setActiveCustomerId(customerId);
  };

  if (isDataLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <Loader2 size={48} className="animate-spin text-bpjs-primary" />
        <p className="ml-4 text-xl text-slate-700">Memuat data pelanggan...</p>
      </div>
    );
  }

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
                data={activeCustomerData} // Kirim data pelanggan aktif
                allCustomers={customerStates} // Kirim semua data pelanggan
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
                activeCustomerId={activeCustomerId}
            />
          </div>
          <div className="flex-1 h-full z-10 pt-6">
            <ChatInterface 
              messages={activeCustomerMessages} // Kirim pesan pelanggan aktif
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
                messages={activeCustomerMessages} // Kirim pesan pelanggan aktif
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