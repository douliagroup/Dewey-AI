import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { translations, Language } from '../translations';
import { supabase } from '../lib/supabase';
import { AcademicResult, Profile } from '../types';

interface ProgressProps {
  lang: Language;
  profile: Profile;
}

export function Progress({ lang, profile }: ProgressProps) {
  const t = translations[lang];
  const [results, setResults] = useState<AcademicResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_URL.startsWith('http')) {
        // Mock data if not configured
        setResults([
          { id: '1', student_id: 'child-123', subject: lang === 'fr' ? 'Mathématiques' : 'Mathematics', grade: 16, term: 'Term 2', year: '2025-2026', attendance_rate: 95, created_at: new Date().toISOString() },
          { id: '2', student_id: 'child-123', subject: lang === 'fr' ? 'Physique' : 'Physics', grade: 14, term: 'Term 2', year: '2025-2026', attendance_rate: 90, created_at: new Date().toISOString() },
          { id: '3', student_id: 'child-123', subject: lang === 'fr' ? 'Anglais' : 'English', grade: 15.5, term: 'Term 2', year: '2025-2026', attendance_rate: 85, created_at: new Date().toISOString() },
          { id: '4', student_id: 'child-123', subject: lang === 'fr' ? 'Français' : 'French', grade: 13, term: 'Term 2', year: '2025-2026', attendance_rate: 88, created_at: new Date().toISOString() },
        ]);
        setLoading(false);
        return;
      }

      if (profile.student_id) {
        const { data } = await supabase
          .from('academic_results')
          .select('*')
          .eq('student_id', profile.student_id)
          .order('created_at', { ascending: false });
        
        if (data) setResults(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [profile, lang]);

  const getTrendColor = (grade: number) => {
    if (grade >= 16) return 'bg-dewey-lemon';
    if (grade >= 12) return 'bg-blue-500';
    if (grade >= 10) return 'bg-dewey-yellow';
    return 'bg-dewey-orange';
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-dewey-dark">{t.academic_overview}</h1>
        <p className="text-sm text-gray-500 italic">{t.term} 2 • {t.year} 2025-2026</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dewey-dark p-4 rounded-2xl text-white space-y-1">
          <Award className="text-dewey-lemon mb-2" size={24} />
          <p className="text-[10px] uppercase opacity-60">{t.class_rank}</p>
          <p className="text-xl font-bold">3ème / 45</p>
        </div>
        <div className="bg-dewey-lemon p-4 rounded-2xl text-dewey-dark space-y-1">
          <TrendingUp className="mb-2" size={24} />
          <p className="text-[10px] uppercase opacity-60">{t.progression}</p>
          <p className="text-xl font-bold">+12%</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t.grades_by_subject}</h3>
        <div className="space-y-3">
          {results.map((s, idx) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${getTrendColor(s.grade)}`} />
                  <span className="text-sm font-bold">{s.subject}</span>
                </div>
                <span className="text-sm font-bold">{s.grade}/20</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.grade / 20) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full ${getTrendColor(s.grade)}`}
                />
              </div>
            </motion.div>
          ))}
          {results.length === 0 && (
            <div className="text-center py-8 text-gray-400 italic text-sm">
              {lang === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
            </div>
          )}
        </div>
      </div>

      <div className="bg-dewey-orange/10 p-4 rounded-2xl border border-dewey-orange/20 flex items-start space-x-3">
        <BookOpen className="text-dewey-orange shrink-0" size={20} />
        <div className="space-y-1">
          <p className="text-xs font-bold text-dewey-orange">{t.mentor_advice}</p>
          <p className="text-[11px] text-dewey-dark/80 leading-relaxed">
            {t.mentor_advice_content}
          </p>
        </div>
      </div>
    </div>
  );
}
