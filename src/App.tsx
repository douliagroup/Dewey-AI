import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Chat } from './components/Chat';
import { Progress } from './components/Progress';
import { Settings } from './components/Settings';
import { LogIn, GraduationCap, Loader2, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from './translations';

export default function App() {
  const { user, profile, loading, signIn, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'fr' : 'en');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await signIn(email);
    } catch (error) {
      console.error(error);
      alert(t.error_login);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-dewey-dark text-white space-y-4">
        <Loader2 className="animate-spin text-dewey-lemon" size={48} />
        <p className="text-sm font-bold uppercase tracking-widest animate-pulse">{t.app_name}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6">
        <div className="flex justify-end">
          <button 
            onClick={toggleLang}
            className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full text-xs font-bold text-dewey-dark hover:bg-gray-200 transition-all"
          >
            <Languages size={16} />
            <span>{lang === 'en' ? 'FR' : 'EN'}</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-24 w-auto px-4 bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-gray-100"
          >
            <img 
              src="https://deweycameroon.net/wp-content/uploads/2021/05/logo-hrz.png" 
              alt="Dewey Logo" 
              className="h-12 object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-dewey-dark tracking-tight">{t.app_name}</h1>
            <p className="text-gray-500 font-medium">{t.slogan}</p>
          </div>

          <form onSubmit={handleSignIn} className="w-full max-w-sm space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400 ml-4">{t.identifier}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email_placeholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-dewey-dark/10 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-dewey-dark text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {isSigningIn ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              <span>{t.login}</span>
            </button>
          </form>
        </div>
        
        <footer className="py-8 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dewey International School © 2026</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen relative shadow-2xl overflow-hidden">
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={toggleLang}
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-dewey-dark border border-gray-200 shadow-sm hover:bg-white transition-all"
          >
            <Languages size={14} />
            <span>{lang === 'en' ? 'FR' : 'EN'}</span>
          </button>
        </div>
        
        <main className="min-h-screen pb-24">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && profile && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard profile={profile} lang={lang} />
              </motion.div>
            )}
            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Progress lang={lang} />
              </motion.div>
            )}
            {activeTab === 'ai' && profile && (
              <motion.div
                key="ai"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Chat profile={profile} lang={lang} />
              </motion.div>
            )}
            {activeTab === 'settings' && profile && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Settings profile={profile} onSignOut={signOut} lang={lang} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
      </div>
    </div>
  );
}
