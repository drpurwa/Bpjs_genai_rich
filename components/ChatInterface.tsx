import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Loader2, MoreVertical, Phone, Video, BadgeCheck, CheckCheck, Mic, Square, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isReadOnly?: boolean; // New prop for Live Mode
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, isReadOnly = false }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<any>(null);
  const initialTextRef = useRef<string>(''); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; 
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'id-ID';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const base = initialTextRef.current.trim();
        const combined = base ? `${base} ${transcript}` : transcript;
        setInputText(combined);
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      initialTextRef.current = inputText;
      recognitionRef.current?.start();
    }
  };

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      if (isListening) recognitionRef.current?.stop();
      onSendMessage(inputText);
      setInputText('');
      initialTextRef.current = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#efe7dd] relative font-sans">
      {/* Header */}
      <div className={`h-16 flex items-center px-4 shrink-0 z-10 shadow-md text-white transition-colors duration-500 ${isReadOnly ? 'bg-slate-800' : 'bg-[#008069]'}`}>
        <div className="flex items-center flex-1 gap-3">
          <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center overflow-hidden border border-white/20">
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Logo_BPJS_Kesehatan.png" alt="BPJS" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h2 className="font-semibold text-[16px] leading-tight">PANDAWA</h2>
              <BadgeCheck size={16} className="text-white fill-[#1DA1F2]" /> 
            </div>
            <span className="text-[11px] opacity-90 text-white/90">
              {isReadOnly ? '● Live Auto-Reply Mode' : 'Asisten Virtual JKN'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-5 opacity-90">
           <Video size={22} className="cursor-pointer hover:opacity-80 transition-opacity" />
           <Phone size={20} className="cursor-pointer hover:opacity-80 transition-opacity" />
           <MoreVertical size={20} className="cursor-pointer hover:opacity-80 transition-opacity" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {messages.filter(m => m.role !== 'system').map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-1.5 text-[14px] shadow-sm relative
              ${msg.role === 'user' ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-none' : 'bg-white text-slate-900 rounded-tl-none'}`}
            >
               <div className="prose prose-sm max-w-none prose-p:my-1 break-words">
                 <ReactMarkdown 
                    components={{
                      strong: ({node, ...props}) => <span className="font-bold text-slate-900" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 underline" target="_blank" {...props} />
                    }}
                  >
                    {msg.content}
                 </ReactMarkdown>
               </div>
              <div className="text-[10px] mt-1 text-right flex justify-end items-center gap-1 opacity-60">
                 {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 {msg.role === 'user' && <CheckCheck size={15} className="text-[#53bdeb]" />}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start w-full">
             <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm flex items-center gap-2">
                 <span className="text-xs text-slate-500 italic mr-2">Sedang mengetik...</span>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
               </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isReadOnly ? (
        <div className="p-3 bg-[#f0f2f5] flex items-center justify-center shrink-0 pb-safe shadow-inner">
           <div className="bg-slate-200 text-slate-500 px-6 py-3 rounded-full text-sm font-medium flex items-center gap-2 w-full justify-center border border-slate-300">
              <Lock size={16} />
              <span>Mode Live Sync: AI akan membalas otomatis</span>
           </div>
        </div>
      ) : (
        <div className="p-2 bg-[#f0f2f5] flex items-center gap-2 shrink-0 pb-safe">
          <div className="flex-1 bg-white rounded-full border-none px-4 py-2 flex items-center shadow-sm gap-2">
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-[15px] text-slate-800"
              placeholder={isListening ? "Mendengarkan..." : "Ketik pesan"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isLoading}
              autoFocus
            />
            <button 
              onClick={toggleListening} 
              className={`transition-all duration-300 p-1.5 rounded-full ${isListening ? 'bg-red-50 text-red-500 scale-110 shadow-inner ring-1 ring-red-200' : 'text-slate-400 hover:text-[#008069]'}`}
            >
              {isListening ? (
                <Square size={18} className="fill-current animate-pulse text-red-600" />
              ) : (
                <Mic size={20} />
              )}
            </button>
          </div>
          <button 
            onClick={handleSend} 
            disabled={isLoading || !inputText.trim()} 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#008069] text-white hover:bg-[#006d59] disabled:opacity-70 transition-colors shadow-sm active:scale-95"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
          </button>
        </div>
      )}
    </div>
  );
};