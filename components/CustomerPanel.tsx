import React, { useState } from 'react';
import { CustomerData } from '../types';
import { InfoCard } from './InfoCard';
import { API_BASE_URL, CUSTOMERS } from '../constants';
import { 
    User, CreditCard, History, Activity, AlertTriangle, Smartphone, 
    BrainCircuit, Send, CheckCircle, Loader2, XCircle, Phone, 
    Link2, Link2Off, ChevronDown, ChevronUp, Wifi, WifiOff, ShieldCheck, 
    Copy, ArrowUpRight, ArrowDownLeft, Info, PlayCircle, Settings, MessageSquare, Key, Check, Hash
} from 'lucide-react';

interface CustomerPanelProps {
  data: CustomerData;
  targetPhone: string;
  setTargetPhone: (val: string) => void;
  whatsappToken: string;
  setWhatsappToken: (val: string) => void;
  phoneId: string;
  setPhoneId: (val: string) => void;
  isLiveSync: boolean;
  setIsLiveSync: (val: boolean) => void;
  webhookStatus: {lastTime: string | null, lastSender: string | null, rawBody?: any};
  backendConnection: 'checking' | 'connected' | 'error';
  simulating: boolean;
  onSimulateWebhook: () => void;
  onSwitchCustomer: (id: string) => void;
}

export const CustomerPanel: React.FC<CustomerPanelProps> = ({ 
    data, 
    targetPhone, 
    setTargetPhone,
    whatsappToken,
    setWhatsappToken,
    phoneId,
    setPhoneId,
    isLiveSync,
    setIsLiveSync,
    webhookStatus,
    backendConnection,
    simulating,
    onSimulateWebhook,
    onSwitchCustomer
}) => {
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const handleVerifyCredentials = async () => {
    const cleanToken = whatsappToken.trim();
    const cleanPhoneId = phoneId.trim();

    if (!cleanToken || !cleanPhoneId) {
        alert("Mohon isi Access Token dan Phone Number ID!");
        return;
    }
    
    setTokenStatus('idle');
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/verify-token`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ token: cleanToken, phoneId: cleanPhoneId })
        });
        const json = await res.json();
        if (json.success) {
            setTokenStatus('valid');
            alert(`✅ Credentials Valid!\n\nVerified Name: ${json.data.verified_name || 'WhatsApp Business Account'}\nID: ${json.data.id}`);
        } else {
            setTokenStatus('invalid');
            alert(`❌ Invalid!\n\nError: ${json.error}\nDetail: ${JSON.stringify(json.details)}`);
        }
    } catch (e: any) {
        setTokenStatus('invalid');
        alert("❌ Gagal menghubungi backend.\nPastikan server backend running.");
    }
  };

  const handleSendTemplate = async () => {
    setSendingStatus('sending');
    setErrorMessage('');
    
    try {
      const BACKEND_URL = `${API_BASE_URL}/api/send-message`;
      
      // Kirim Template 'hello_world' sebagai test
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: data.id,
          target: targetPhone,
          token: whatsappToken.trim(),
          phoneId: phoneId.trim(),
          isTemplate: true, // Flag untuk kirim template
          message: "hello_world" // Nama template default
        }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setSendingStatus('success');
        setTimeout(() => setSendingStatus('idle'), 3000);
      } else {
        setSendingStatus('error');
        const detailMsg = json.details ? ` (${JSON.stringify(json.details)})` : '';
        setErrorMessage((json.error || 'Gagal kirim.') + detailMsg);
      }
    } catch (error: any) {
      console.error("Gagal menghubungi backend:", error);
      setSendingStatus('error');
      setErrorMessage("Network Error: " + (error.message || 'Check connection'));
    }
  };

  const lastPromise = data.payment_commitment_history.last_promise || data.payment_commitment_history.promises?.[0];

  return (
    <div className="h-full flex flex-col bg-slate-50 border-r border-slate-200">
      
      {/* HEADER & CONTROLS */}
      <div className="p-4 border-b border-slate-200 bg-white z-10 shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-slate-800">
                RICH <span className="text-bpjs-primary">Dashboard</span>
            </h1>
            <button 
                onClick={() => setIsControlPanelOpen(!isControlPanelOpen)}
                className={`p-1.5 rounded-full transition-colors border ${isControlPanelOpen ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                title={isControlPanelOpen ? "Tutup Panel Kontrol" : "Buka Panel Kontrol"}
            >
                {isControlPanelOpen ? <ChevronUp size={16} /> : <Settings size={16} />}
            </button>
        </div>

        {/* Control Box (Collapsible) */}
        {isControlPanelOpen && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-3 animate-in slide-in-from-top-2 fade-in duration-300 origin-top">
                
                {/* Customer Selector */}
                <div className="relative group">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">Data Peserta</div>
                    <div className="relative">
                        <select 
                            className="w-full appearance-none bg-white border border-slate-300 text-slate-700 text-xs rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-bpjs-primary font-medium"
                            value={data.id}
                            onChange={(e) => onSwitchCustomer(e.target.value)}
                        >
                            {CUSTOMERS.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.peserta_profile.gender === 'L' ? 'Bpk' : 'Ibu'} {c.peserta_profile.status_kepesertaan} - Rp{c.billing_info.total_tunggakan.toLocaleString('id-ID')}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* WhatsApp Token Input */}
                <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">Meta Access Token</div>
                    <div className="flex gap-1">
                        <div className="flex-1 flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-300">
                            <Key size={14} className="text-slate-400" />
                            <input 
                                type="password" 
                                value={whatsappToken}
                                onChange={(e) => setWhatsappToken(e.target.value)}
                                className="w-full text-xs font-mono outline-none text-slate-700 placeholder-slate-300"
                                placeholder="EAA..."
                            />
                        </div>
                    </div>
                </div>

                {/* Phone ID Input */}
                <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 ml-1">Phone Number ID</div>
                    <div className="flex gap-1">
                        <div className="flex-1 flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-300">
                            <Hash size={14} className="text-slate-400" />
                            <input 
                                type="text" 
                                value={phoneId}
                                onChange={(e) => setPhoneId(e.target.value)}
                                className="w-full text-xs font-mono outline-none text-slate-700 placeholder-slate-300"
                                placeholder="Contoh: 1234567890"
                            />
                        </div>
                        <button 
                            onClick={handleVerifyCredentials}
                            title="Cek Token & PhoneID"
                            className={`px-2 rounded-md border text-xs font-bold transition-colors ${tokenStatus === 'valid' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'}`}
                        >
                            {tokenStatus === 'valid' ? <Check size={14}/> : '?'}
                        </button>
                    </div>
                </div>

                {/* Target Phone Input */}
                <div>
                    <div className="flex items-center justify-between mb-1 ml-1">
                         <div className="text-[10px] uppercase font-bold text-slate-400">Target Phone (WA)</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-slate-300">
                        <Smartphone size={14} className="text-slate-400" />
                        <input 
                            type="text" 
                            value={targetPhone}
                            onChange={(e) => setTargetPhone(e.target.value)}
                            className="w-full text-xs font-mono outline-none text-slate-700 placeholder-slate-300"
                            placeholder="628123..."
                        />
                    </div>
                </div>

                {/* Connect Toggle */}
                <div>
                    <button 
                        onClick={() => setIsLiveSync(!isLiveSync)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-xs font-bold transition-all
                        ${isLiveSync 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'}`}
                    >
                        <div className="flex items-center gap-2">
                            {isLiveSync ? <Link2 size={14} /> : <Link2Off size={14} />}
                            {isLiveSync ? 'WHATSAPP BOT: ON' : 'OFFLINE MODE'}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${isLiveSync ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    </button>
                    
                    {/* Debug Info Mini / Expandable */}
                    {isLiveSync && (
                        <div className="mt-2">
                            <button 
                                onClick={() => setShowDebug(!showDebug)}
                                className="w-full text-[10px] text-blue-600 flex items-center justify-center gap-1 hover:underline mb-1"
                            >
                            {showDebug ? 'Sembunyikan Detail Webhook' : 'Lihat Detail Webhook'}
                            </button>

                            {showDebug && (
                                <div className="bg-slate-800 text-white p-3 rounded-md text-[10px] space-y-3 animate-in fade-in slide-in-from-top-2">
                                    {/* Config Info */}
                                    <div className="space-y-1 pb-2 border-b border-slate-600">
                                        <div className="font-bold text-green-400 mb-1">SETUP DI META DASHBOARD:</div>
                                        
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <ShieldCheck size={10} /> <span>Callback URL:</span>
                                        </div>
                                        <div className="flex bg-black/30 p-1 rounded gap-1">
                                            <code className="flex-1 truncate text-white">{API_BASE_URL}/webhook</code>
                                            <Copy size={10} className="cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(`${API_BASE_URL}/webhook`)}/>
                                        </div>

                                        <div className="flex items-center gap-1 text-slate-400 mt-1">
                                            <Key size={10} /> <span>Verify Token:</span>
                                        </div>
                                        <div className="flex bg-black/30 p-1 rounded gap-1">
                                            <code className="flex-1 truncate text-white">rich-ai-verify-token</code>
                                            <Copy size={10} className="cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(`rich-ai-verify-token`)}/>
                                        </div>
                                    </div>

                                    {/* Status Connection */}
                                    <div className="flex items-center justify-between">
                                        <span>Backend:</span>
                                        <span className={backendConnection === 'connected' ? 'text-green-400' : 'text-red-400'}>
                                            {backendConnection === 'connected' ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                    </div>

                                    {/* Webhook Status */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span>Incoming Msg:</span>
                                            <span className={webhookStatus.lastTime ? 'text-green-400' : 'text-yellow-400'}>
                                                {webhookStatus.lastTime ? 'RECEIVED' : 'WAITING'}
                                            </span>
                                        </div>
                                        {webhookStatus.lastTime ? (
                                            <div className="bg-black/30 p-1 rounded text-slate-300">
                                                <div>From: {webhookStatus.lastSender}</div>
                                                <div className="text-[9px] opacity-70">{webhookStatus.lastTime}</div>
                                            </div>
                                        ) : (
                                            <div className="text-slate-500 italic">Belum ada pesan masuk.</div>
                                        )}
                                    </div>

                                    {/* Simulation Button */}
                                    <button 
                                        onClick={onSimulateWebhook}
                                        disabled={simulating}
                                        className="w-full bg-slate-700 hover:bg-slate-600 border border-slate-600 py-1.5 rounded flex items-center justify-center gap-1 text-white disabled:opacity-50"
                                    >
                                        <PlayCircle size={10} /> Test Webhook
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300">
        
        {/* Action Button */}
        <div>
            <button 
            onClick={handleSendTemplate}
            disabled={sendingStatus === 'sending' || sendingStatus === 'success'}
            className={`w-full py-2.5 rounded-lg shadow-sm font-medium text-sm flex items-center justify-center gap-2 transition-all
                ${sendingStatus === 'success' 
                ? 'bg-green-600 text-white' 
                : sendingStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
            >
            {sendingStatus === 'idle' && (
                <>
                <Send size={16} />
                Kirim Template (Hello World)
                </>
            )}
            {sendingStatus === 'sending' && (
                <>
                <Loader2 size={16} className="animate-spin" />
                Mengirim...
                </>
            )}
            {sendingStatus === 'success' && (
                <>
                <CheckCircle size={16} />
                Terkirim!
                </>
            )}
            {sendingStatus === 'error' && (
                <>
                <XCircle size={16} />
                Gagal Kirim
                </>
            )}
            </button>
            
            {sendingStatus === 'error' && errorMessage && (
            <div className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-200 break-words leading-tight">
                <strong>Error:</strong> {errorMessage}
            </div>
            )}
        </div>

        {/* Profile Card */}
        <InfoCard title="Profil Peserta" icon={<User size={14} />}>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-slate-500">No. Kartu</div>
            <div className="font-medium text-slate-800">{data.peserta_profile.nokapst_masked}</div>
            
            <div className="text-slate-500">Status</div>
            <div className="font-medium text-slate-800">{data.peserta_profile.status_kepesertaan} (Kelas {data.peserta_profile.kelas_rawat})</div>
            
            <div className="text-slate-500">Tanggungan</div>
            <div className="font-medium text-slate-800">{data.peserta_profile.jumlah_tanggungan} Jiwa</div>
            
            <div className="text-slate-500">Gender/Usia</div>
            <div className="font-medium text-slate-800">{data.peserta_profile.gender} / {data.peserta_profile.usia} th</div>
            </div>
        </InfoCard>

        {/* Behavioral Segment */}
        {data.behavioral_segment && (
            <InfoCard title="Behavioral Insight" icon={<BrainCircuit size={14} />} className="border-purple-200 bg-purple-50/30">
            <div className="text-sm">
                <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Persona</span>
                    <span className="font-bold text-purple-700">{data.behavioral_segment.persona}</span>
                </div>
                <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Gaya Komunikasi</span>
                    <span className="text-slate-800">{data.behavioral_segment.communication_style}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-purple-100">
                    <span className="text-xs text-slate-500 block mb-1">Pain Points:</span>
                    <div className="flex flex-wrap gap-1">
                    {data.behavioral_segment.pain_points.map((p, i) => (
                        <span key={i} className="text-[10px] bg-white border border-purple-100 px-1.5 py-0.5 rounded text-purple-600">{p}</span>
                    ))}
                    </div>
                </div>
            </div>
            </InfoCard>
        )}

        {/* Billing Alert */}
        <InfoCard title="Billing Status" icon={<CreditCard size={14} />} className="border-red-200 bg-red-50/50">
            <div className="flex justify-between items-end mb-2">
            <div className="text-slate-600 text-sm">Total Tunggakan</div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(data.billing_info.total_tunggakan)}</div>
            </div>
            <div className="text-xs text-slate-500 flex justify-between border-t border-red-100 pt-2">
            <span>Periode: {data.billing_info.bulan_menunggak.length} Bulan</span>
            <span>Last Pay: {data.billing_info.last_payment_date}</span>
            </div>
        </InfoCard>

        {/* Strategy Badge */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
            <Activity size={12} />
            RECOMMENDED STRATEGY
            </div>
            <p className="text-sm text-blue-900 font-medium">{data.strategy.approach}</p>
            <p className="text-xs text-blue-600 mt-1">{data.strategy.tone} • {data.strategy.urgency}</p>
        </div>

        {/* Commitment History */}
        <InfoCard title="Riwayat Komitmen" icon={<History size={14} />}>
            <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600">Credibility Score</span>
            <div className="w-24 bg-slate-200 rounded-full h-2">
                <div 
                    className={`h-2 rounded-full ${data.payment_commitment_history.credibility_score < 0.5 ? 'bg-red-500' : 'bg-yellow-500'}`} 
                    style={{ width: `${data.payment_commitment_history.credibility_score * 100}%` }}
                ></div>
            </div>
            </div>
            {lastPromise && (
            <div className="bg-slate-100 p-2 rounded text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                <span>Janji Terakhir</span>
                <span className="text-red-500 uppercase">{lastPromise.status}</span>
                </div>
                <div className="flex justify-between mt-1 text-slate-500">
                <span>{lastPromise.promised_date}</span>
                <span>{lastPromise.days_overdue} hari lewat</span>
                </div>
            </div>
            )}
        </InfoCard>

        {/* Claim History - THE TRIGGER */}
        <InfoCard title="Data Klaim (Leverage)" icon={<Activity size={14} />} className="border-emerald-200 bg-emerald-50/30">
            <div className="space-y-2">
            <div className="flex justify-between items-start">
                <div>
                <div className="text-sm font-bold text-emerald-800">{data.claim_history.last_claim.hospital}</div>
                <div className="text-xs text-emerald-600">{data.claim_history.last_claim.diagnosis} • {data.claim_history.last_claim.type}</div>
                </div>
                <div className="text-right">
                <div className="text-sm font-bold text-emerald-700">{formatCurrency(data.claim_history.last_claim.claim_amount)}</div>
                <div className="text-[10px] text-emerald-500">{data.claim_history.last_claim.date}</div>
                </div>
            </div>
            </div>
        </InfoCard>

        {/* Interaction History */}
        <InfoCard title="Kontak Terakhir" icon={<Smartphone size={14} />}>
            <div className="text-xs space-y-1">
            <div className="flex justify-between">
                <span className="text-slate-500">Agent</span>
                <span className="font-medium">{data.interaction_history.last_contact.agent_name}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-500">Tanggal</span>
                <span className="font-medium">{data.interaction_history.last_contact.date}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-slate-500">Hasil</span>
                <span className="font-medium text-orange-600">{data.interaction_history.last_contact.outcome}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 text-slate-600 italic">
                "{data.interaction_history.last_contact.alasan_tunggak}"
            </div>
            </div>
        </InfoCard>

      </div>
    </div>
  );
};