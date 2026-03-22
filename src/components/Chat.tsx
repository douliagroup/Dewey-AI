import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Mic, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Profile, AcademicResult } from '../types';
import { chatWithMentor, generateSpeech } from '../services/geminiService';
import { cn } from '../lib/utils';
import { translations, Language } from '../translations';
import { supabase } from '../lib/supabase';

interface ChatProps {
  profile: Profile;
  lang: Language;
}

export function Chat({ profile, lang }: ChatProps) {
  const t = translations[lang];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: lang === 'fr' 
        ? `Bonjour **${profile.full_name.split(' ')[0]}**. Je suis votre **Dewey Mentor AI**. Comment puis-je vous accompagner aujourd'hui ?`
        : `Hello **${profile.full_name.split(' ')[0]}**. I am your **Dewey Mentor AI**. How can I assist you today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [academicResults, setAcademicResults] = useState<AcademicResult[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchBroadData() {
      if (profile.role === 'admin') {
        const { data: profs } = await supabase.from('profils').select('identifiant, "nom et prénom", rôle');
        const { data: res } = await supabase.from('résultats_académiques').select('*');
        if (profs) setAllProfiles(profs);
        if (res) setAllResults(res);
      }
    }
    fetchBroadData();
  }, [profile]);

  useEffect(() => {
    async function fetchAcademicData() {
      if (profile.student_id && profile.role !== 'admin') {
        const { data } = await supabase
          .from('résultats_académiques')
          .select('*')
          .eq('identifiant_étudiant', profile.student_id)
          .order('created_at', { ascending: false });
        
        if (data) {
          const mappedData: AcademicResult[] = data.map((item: any) => ({
            id: item.identifiant,
            student_id: item.identifiant_étudiant,
            subject: item.sujet,
            grade: typeof item.grade === 'string' ? parseFloat(item.grade.replace(',', '.')) : item.grade,
            term: item.terme || 'Term 2',
            year: item.année || '2025-2026',
            attendance_rate: item.taux_de_fréquentation || 82,
            created_at: item.created_at
          }));
          setAcademicResults(mappedData);
        }
      }
    }
    fetchAcademicData();
  }, [profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const playAudio = async (text: string) => {
    if (isMuted) return;
    const base64 = await generateSpeech(text);
    if (base64) {
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      audioRef.current = audio;
      audio.play();
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const fullContext = {
      profile,
      academicResults: profile.role === 'admin' ? allResults : academicResults,
      allProfiles: profile.role === 'admin' ? allProfiles : []
    };

    const response = await chatWithMentor([...messages, userMessage], fullContext, lang);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
    playAudio(response);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 relative">
      {/* Chat Header */}
      <div className="bg-dewey-dark p-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-dewey-lemon flex items-center justify-center">
            <Bot className="text-dewey-dark" size={24} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">{t.app_name}</h2>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-dewey-lemon rounded-full animate-pulse" />
              <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
                {lang === 'fr' ? 'En ligne' : 'Online'}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "p-2 rounded-full transition-all",
            isMuted ? "bg-white/10 text-white/40" : "bg-dewey-lemon text-dewey-dark"
          )}
          title={isMuted ? t.voice_output : t.voice_output_on}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-32"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] rounded-2xl p-5 shadow-sm",
                msg.role === 'user' 
                  ? "bg-dewey-dark text-white rounded-tr-none" 
                  : "bg-white text-dewey-dark border border-gray-100 rounded-tl-none"
              )}>
                <div className="flex items-center space-x-2 mb-3">
                  {msg.role === 'assistant' ? (
                    <Sparkles size={14} className="text-dewey-orange" />
                  ) : (
                    <User size={14} className="text-white/60" />
                  )}
                  <span className="text-[10px] font-bold uppercase opacity-50 tracking-widest">
                    {msg.role === 'assistant' ? 'Mentor AI' : (lang === 'fr' ? 'Vous' : 'You')}
                  </span>
                </div>
                <div className="markdown-content text-sm leading-relaxed space-y-4">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                      ol: ({ children }) => <ol className="space-y-3 my-4 [counter-reset:chat-list] list-decimal-custom">{children}</ol>,
                      ul: ({ children }) => <ul className="space-y-3 my-4 list-bullet-custom">{children}</ul>,
                      li: ({ children }) => (
                        <li className="flex items-start space-x-3 list-none relative">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dewey-olive text-white flex items-center justify-center text-[10px] font-bold mt-0.5 list-marker">
                          </span>
                          <span className="flex-1">{children}</span>
                        </li>
                      ),
                      strong: ({ children }) => <strong className="font-black text-dewey-dark">{children}</strong>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <p className="text-[9px] mt-4 opacity-40 text-right font-medium">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <div className="flex space-x-1.5">
                <div className="h-2 w-2 bg-dewey-olive/40 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-dewey-olive/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 bg-dewey-olive/40 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-20">
        <div className="flex items-center space-x-2 max-w-md mx-auto">
          <button
            onClick={startListening}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center transition-all shrink-0 shadow-sm",
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            )}
            title={t.voice_input}
          >
            <Mic size={22} />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chat_placeholder}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-dewey-dark/10 transition-all shadow-inner"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center transition-all",
                input.trim() ? "bg-dewey-dark text-white shadow-md" : "bg-gray-200 text-gray-400"
              )}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
