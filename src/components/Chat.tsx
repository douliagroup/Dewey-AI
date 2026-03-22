import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Profile } from '../types';
import { chatWithMentor, generateSpeech } from '../services/geminiService';
import { cn } from '../lib/utils';
import { translations, Language } from '../translations';

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
        ? `Bonjour 𝗕𝗼𝗻𝗷𝗼𝘂𝗿 ${profile.full_name.split(' ')[0]}. Je suis votre 𝗗𝗲𝘄𝗲𝘆 𝗠𝗲𝗻𝘁𝗼𝗿 𝗔𝗜. Comment puis-je vous accompagner aujourd'hui ?`
        : `Hello 𝗛𝗲𝗹𝗹𝗼 ${profile.full_name.split(' ')[0]}. I am your 𝗗𝗲𝘄𝗲𝘆 𝗠𝗲𝗻𝘁𝗼𝗿 𝗔𝗜. How can I assist you today?`,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

    const response = await chatWithMentor([...messages, userMessage], profile);
    
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
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
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
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
                "max-w-[85%] rounded-2xl p-4 shadow-sm",
                msg.role === 'user' 
                  ? "bg-dewey-dark text-white rounded-tr-none" 
                  : "bg-white text-dewey-dark border border-gray-100 rounded-tl-none"
              )}>
                <div className="flex items-center space-x-2 mb-1">
                  {msg.role === 'assistant' ? (
                    <Sparkles size={12} className="text-dewey-orange" />
                  ) : (
                    <User size={12} className="text-white/60" />
                  )}
                  <span className="text-[10px] font-bold uppercase opacity-50">
                    {msg.role === 'assistant' ? 'Mentor AI' : (lang === 'fr' ? 'Vous' : 'You')}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
                <p className="text-[9px] mt-2 opacity-40 text-right">
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
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce" />
                <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-1.5 w-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100 pb-20">
        <div className="flex items-center space-x-2">
          <button
            onClick={startListening}
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center transition-all shrink-0",
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
            )}
            title={t.voice_input}
          >
            {isListening ? <Mic size={20} /> : <Mic size={20} />}
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chat_placeholder}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-dewey-dark/10 transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center transition-all",
                input.trim() ? "bg-dewey-dark text-white" : "bg-gray-200 text-gray-400"
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
