import React from 'react';
import { TrendingUp, Award, BookOpen, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';

interface ProgressProps {
  lang: Language;
}

export function Progress({ lang }: ProgressProps) {
  const t = translations[lang];
  const subjects = [
    { name: lang === 'fr' ? 'Mathématiques' : 'Mathematics', grade: 16, trend: 'up', color: 'bg-blue-500' },
    { name: lang === 'fr' ? 'Physique' : 'Physics', grade: 14, trend: 'up', color: 'bg-purple-500' },
    { name: lang === 'fr' ? 'Anglais' : 'English', grade: 15.5, trend: 'down', color: 'bg-dewey-orange' },
    { name: lang === 'fr' ? 'Français' : 'French', grade: 13, trend: 'stable', color: 'bg-dewey-olive' },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-dewey-dark">{t.academic_overview}</h1>
        <p className="text-sm text-gray-500 italic">Term 2 • 2025-2026</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dewey-dark p-4 rounded-2xl text-white space-y-1">
          <Award className="text-dewey-lemon mb-2" size={24} />
          <p className="text-[10px] uppercase opacity-60">Rang Classe</p>
          <p className="text-xl font-bold">3ème / 45</p>
        </div>
        <div className="bg-dewey-lemon p-4 rounded-2xl text-dewey-dark space-y-1">
          <TrendingUp className="mb-2" size={24} />
          <p className="text-[10px] uppercase opacity-60">Progression</p>
          <p className="text-xl font-bold">+12%</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Notes par Matière</h3>
        <div className="space-y-3">
          {subjects.map((s, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${s.color}`} />
                  <span className="text-sm font-bold">{s.name}</span>
                </div>
                <span className="text-sm font-bold">{s.grade}/20</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.grade / 20) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full ${s.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-dewey-orange/10 p-4 rounded-2xl border border-dewey-orange/20 flex items-start space-x-3">
        <BookOpen className="text-dewey-orange shrink-0" size={20} />
        <div className="space-y-1">
          <p className="text-xs font-bold text-dewey-orange">Conseil du Mentor</p>
          <p className="text-[11px] text-dewey-dark/80 leading-relaxed">
            Concentrez-vous sur l'Anglais cette semaine. Une légère baisse a été notée, mais avec votre potentiel, vous remonterez vite !
          </p>
        </div>
      </div>
    </div>
  );
}
