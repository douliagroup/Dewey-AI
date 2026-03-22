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
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string) => {
    // For demo purposes, we'll use a mock sign in if no Supabase URL is set
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && 
                        import.meta.env.VITE_SUPABASE_URL.startsWith('http');

    if (!isConfigured) {
      const mockUser = { id: 'mock-id', email };
      setUser(mockUser);
      setProfile({
        id: 'mock-id',
        full_name: 'Parent Demo',
        role: 'parent',
        student_id: 'child-123'
      });
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signIn, signOut };
}
