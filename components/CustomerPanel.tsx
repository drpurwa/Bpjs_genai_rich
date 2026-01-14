import React, { useState } from 'react';
import { CustomerData } from '../types';
import { InfoCard } from './InfoCard';
import { API_BASE_URL } from '../constants';
import { User, CreditCard, History, Activity, AlertTriangle, Smartphone, BrainCircuit, Send, CheckCircle, Loader2, XCircle } from 'lucide-react';

interface CustomerPanelProps {
  data: CustomerData;
}

export const CustomerPanel: React.FC<CustomerPanelProps> = ({ data }) => {
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Logic untuk memanggil Backend Node.js
  const handleSendReminder = async () => {
    setSendingStatus('sending');
    setErrorMessage('');
    
    try {
      // Menggunakan URL dinamis dari constants.ts
      const BACKEND_URL = `${API_BASE_URL}/api/send-message`;
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: data.id,
          // Mengambil pesan rekomendasi dari strategy atau default
          message: `Halo Bapak/Ibu, kami dari BPJS Kesehatan. Mengingatkan total tunggakan Anda sebesar ${formatCurrency(data.billing_info.total_tunggakan)}. Mohon segera diselesaikan.`
        }),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        setSendingStatus('success');
        setTimeout(() => setSendingStatus('idle'), 3000);
      } else {
        setSendingStatus('error');
        setErrorMessage(json.error || 'Gagal mengirim pesan via Backend.');
      }
    } catch (error: any) {
      console.error("Gagal menghubungi backend:", error);
      setSendingStatus('error');
      setErrorMessage(error.message || 'Network Error / Backend Down');
    }
  };

  // Safe accessor for payment promise status
  const lastPromise = data.payment_commitment_history.last_promise || data.payment_commitment_history.promises?.[0];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">RICH <span className="text-bpjs-primary">Dashboard</span></h1>
          <p className="text-xs text-slate-500">Case ID: {data.id.slice(-8)}...</p>
        </div>
        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <AlertTriangle size={12} />
          Overdue
        </div>
      </div>

      {/* Action Button - CONNECTED TO BACKEND */}
      <div className="mb-4">
        <button 
          onClick={handleSendReminder}
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
              Kirim WA Reminder (Real)
            </>
          )}
          {sendingStatus === 'sending' && (
            <>
              <Loader2 size={16} className="animate-spin" />
              Mengirim ke WA...
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
             <br/>
             <span className="opacity-75 italic mt-1 block">Pastikan Token Fonnte valid & Device Connected.</span>
          </div>
        )}
        
        {sendingStatus !== 'error' && (
          <p className="text-[10px] text-center text-slate-400 mt-1">
             *Menggunakan Fonnte Gateway. Pastikan device WA sudah scan QR.
          </p>
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
          
          {data.peserta_profile.pekerjaan && (
            <>
              <div className="text-slate-500">Pekerjaan</div>
              <div className="font-medium text-slate-800">{data.peserta_profile.pekerjaan}</div>
            </>
          )}
          
          <div className="text-slate-500">Gender/Usia</div>
          <div className="font-medium text-slate-800">{data.peserta_profile.gender} / {data.peserta_profile.usia} th</div>
        </div>
      </InfoCard>

      {/* Behavioral Segment (New Feature) */}
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
  );
};