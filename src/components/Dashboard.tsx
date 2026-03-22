import React, { useState, useEffect } from 'react';
import { AlertCircle, GraduationCap, Calendar, Star, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { AcademicResult, Profile } from '../types';
import { translations, Language } from '../translations';

interface DashboardProps {
  profile: Profile;
  lang: Language;
}

export function Dashboard({ profile, lang }: DashboardProps) {
  const t = translations[lang];
  const [results, setResults] = useState<AcademicResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Mock data
        setResults([{
          id: '1',
          student_id: 'child-123',
          subject: 'Global Average',
          grade: 14.5,
          term: 'Term 2',
          year: '2025-2026',
          attendance_rate: 82,
          created_at: new Date().toISOString()
        }]);
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
  }, [profile]);

  const latestResult = results[0];
  const isAttendanceLow = latestResult && latestResult.attendance_rate < 85;

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-dewey-dark">{t.welcome}, {profile.full_name.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 italic">{t.motto}</p>
        </div>
        <img 
          src="https://deweycameroon.net/wp-content/uploads/2021/05/logo-hrz.png" 
          alt="Dewey Logo" 
          className="h-8 object-contain"
          referrerPolicy="no-referrer"
        />
      </header>

      {/* Student Spotlight Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-dewey-dark p-6 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-dewey-olive/20 blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-dewey-orange/20 blur-2xl" />
        
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <GraduationCap size={20} className="text-dewey-lemon" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-dewey-lemon">{t.student_spotlight}</span>
            </div>
            
            <div>
              <h2 className="text-xl font-bold">Jean-Paul Dewey</h2>
              <p className="text-sm text-white/60">Upper Sixth - Science</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-white/40">{t.average}</p>
                <p className="text-2xl font-bold text-dewey-lemon">{latestResult?.grade || '--'}/20</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase text-white/40">{t.attendance}</p>
                <p className={cn("text-2xl font-bold", isAttendanceLow ? "text-dewey-orange" : "text-white")}>
                  {latestResult?.attendance_rate || '--'}%
                </p>
              </div>
            </div>
          </div>

          {isAttendanceLow && (
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex items-center space-x-1 bg-dewey-orange/20 text-dewey-orange px-3 py-1 rounded-full border border-dewey-orange/30"
            >
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold">{t.alert}</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-dewey-lemon/10 rounded-xl text-dewey-olive">
            <Calendar size={24} />
          </div>
          <span className="text-xs font-semibold">{t.schedule}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-dewey-orange/10 rounded-xl text-dewey-orange">
            <Star size={24} />
          </div>
          <span className="text-xs font-semibold">{t.rewards}</span>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">{t.recent_activity}</h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-gray-200">
                <TrendingUp size={18} className="text-dewey-dark" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{t.math_note}</p>
                <p className="text-xs text-gray-500">{t.hours_ago}</p>
              </div>
              <div className="text-sm font-bold text-dewey-olive">+1.5</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
