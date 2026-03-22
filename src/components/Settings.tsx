import React, { useState, useEffect } from 'react';
import { LogOut, User, Bell, Shield, HelpCircle, ChevronRight, X, Mail, Smartphone, Lock, Eye, Database, CheckCircle2, XCircle } from 'lucide-react';
import { Profile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../translations';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  profile: Profile;
  onSignOut: () => void;
  lang: Language;
}

export function Settings({ profile, onSignOut, lang }: SettingsProps) {
  const t = translations[lang];
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error' | 'not_configured'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function checkSupabase() {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!url || !key || url.includes('placeholder')) {
        setSupabaseStatus('not_configured');
        return;
      }

      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          setSupabaseStatus('error');
          setErrorMessage(error.message);
        } else {
          setSupabaseStatus('connected');
        }
      } catch (err) {
        setSupabaseStatus('error');
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
    }
    checkSupabase();
  }, []);

  const sections = [
    { id: 'profile', icon: User, label: t.personal_profile, color: 'text-blue-500' },
    { id: 'notifications', icon: Bell, label: t.notifications, color: 'text-orange-500' },
    { id: 'security', icon: Shield, label: t.security_privacy, color: 'text-green-500' },
    { id: 'help', icon: HelpCircle, label: t.help_support, color: 'text-purple-500' },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="text-center pt-4">
        <div className="mb-6 flex justify-center">
          <img 
            src="https://deweycameroon.net/wp-content/uploads/2021/05/logo-hrz.png" 
            alt="Dewey Logo" 
            className="h-12 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="h-24 w-24 rounded-full bg-dewey-dark mx-auto flex items-center justify-center text-white text-3xl font-bold border-4 border-dewey-lemon shadow-lg">
          {profile.full_name.charAt(0)}
        </div>
        <h2 className="mt-4 text-xl font-bold text-dewey-dark">{profile.full_name}</h2>
        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">{profile.role}</p>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-xl">
              <Database size={20} className="text-dewey-dark" />
            </div>
            <div>
              <p className="text-sm font-bold">Supabase Status</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Database Connection</p>
            </div>
          </div>
          {supabaseStatus === 'checking' && <div className="animate-spin h-4 w-4 border-2 border-dewey-dark border-t-transparent rounded-full" />}
          {supabaseStatus === 'connected' && <CheckCircle2 size={20} className="text-green-500" />}
          {supabaseStatus === 'error' && <XCircle size={20} className="text-red-500" />}
          {supabaseStatus === 'not_configured' && <XCircle size={20} className="text-dewey-orange" />}
        </div>

        <div className="pt-2 border-t border-gray-50">
          {supabaseStatus === 'connected' && (
            <p className="text-xs text-green-600 font-medium">
              {lang === 'fr' ? 'Connecté avec succès à Supabase.' : 'Successfully connected to Supabase.'}
            </p>
          )}
          {supabaseStatus === 'not_configured' && (
            <p className="text-xs text-dewey-orange font-medium">
              {lang === 'fr' ? 'Variables d\'environnement manquantes ou incorrectes.' : 'Environment variables missing or incorrect.'}
            </p>
          )}
          {supabaseStatus === 'error' && (
            <div className="space-y-1">
              <p className="text-xs text-red-600 font-medium">
                {lang === 'fr' ? 'Erreur de connexion :' : 'Connection error:'}
              </p>
              <p className="text-[10px] text-red-400 font-mono break-all">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {sections.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button 
              key={idx}
              onClick={() => setActiveModal(item.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center space-x-4">
                <div className={cn("p-2 rounded-lg bg-gray-50", item.color)}>
                  <Icon size={20} />
                </div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          );
        })}
      </div>

      <button
        onClick={onSignOut}
        className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors"
      >
        <LogOut size={18} />
        <span>{t.sign_out}</span>
      </button>

      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-dewey-dark">
                    {sections.find(s => s.id === activeModal)?.label}
                  </h2>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="p-2 bg-gray-100 rounded-full text-gray-400 hover:text-dewey-dark transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {activeModal === 'profile' && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{t.full_name}</p>
                          <p className="font-bold text-dewey-dark">{profile.full_name}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{t.student_id}</p>
                          <p className="font-bold text-dewey-dark">{profile.student_id || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModal === 'notifications' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <Mail size={20} className="text-dewey-orange" />
                          <span className="font-bold text-dewey-dark">{t.email_notifications}</span>
                        </div>
                        <div className="w-12 h-6 bg-dewey-olive rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <Smartphone size={20} className="text-dewey-orange" />
                          <span className="font-bold text-dewey-dark">{t.push_notifications}</span>
                        </div>
                        <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModal === 'security' && (
                    <div className="space-y-4">
                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <Lock size={20} className="text-dewey-olive" />
                          <span className="font-bold text-dewey-dark">{t.change_password}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </button>
                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <Eye size={20} className="text-dewey-olive" />
                          <span className="font-bold text-dewey-dark">{t.two_factor}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </button>
                    </div>
                  )}

                  {activeModal === 'help' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-dewey-lemon/10 rounded-2xl border border-dewey-lemon/20">
                        <p className="text-sm font-bold text-dewey-dark mb-1">{t.help_center}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {lang === 'fr' ? "Besoin d'aide ? Notre équipe est disponible du lundi au vendredi de 8h à 17h." : "Need help? Our team is available Monday to Friday from 8am to 5pm."}
                        </p>
                      </div>
                      <button className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-dewey-dark text-left">
                        {t.faq}
                      </button>
                      <button className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-dewey-dark text-left">
                        {t.contact_us}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dewey International School v1.0.0</p>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
