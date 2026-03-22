import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && 
                        import.meta.env.VITE_SUPABASE_URL.startsWith('http');
    
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profils')
        .select('identifiant, "nom et prénom", rôle')
        .eq('identifiant', userId)
        .single();

      if (error) throw error;
      
      // Map exact French column names from screenshot
      const mappedProfile: Profile = {
        id: data['identifiant'],
        full_name: data["nom et prénom"] || 'User',
        role: (data['rôle'] === 'professeur' ? 'teacher' : 
               data['rôle'] === 'étudiant' ? 'student' : 
               data['rôle'] === 'administrateur' ? 'admin' : 'parent') as any,
        student_id: data['identifiant'] // For students, their own ID is the student_id
      };
      
      setProfile(mappedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = normalizedEmail === 'douliagroup@gmail.com' || normalizedEmail === 'douliagroup.com'; // Lenient for user typos
    
    // Only use mock sign in if Supabase is NOT configured
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && 
                        import.meta.env.VITE_SUPABASE_URL.startsWith('http');

    if (!isConfigured) {
      const isAdmin = normalizedEmail === 'douliagroup@gmail.com' || normalizedEmail === 'douliagroup.com';
      const mockUser = { id: isAdmin ? 'admin-id' : 'mock-id', email: normalizedEmail };
      setUser(mockUser);
      setProfile({
        id: isAdmin ? 'admin-id' : 'mock-id',
        full_name: isAdmin ? 'Administrator' : 'Parent Demo',
        role: isAdmin ? 'admin' : 'parent',
        student_id: isAdmin ? undefined : 'child-123'
      });
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email: normalizedEmail });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signIn, signOut };
}
