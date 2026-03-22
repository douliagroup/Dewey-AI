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

    // Check for mock session in localStorage for persistence during testing
    const mockSession = localStorage.getItem('dewey_mock_session');
    if (mockSession) {
      const { user: mUser, profile: mProfile } = JSON.parse(mockSession);
      setUser(mUser);
      setProfile(mProfile);
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
      // Try multiple possible table names for resilience
      let data, error;
      
      const tableNames = ['profils', 'Profils', 'profils publics', 'profiles'];
      
      for (const tableName of tableNames) {
        const result = await supabase
          .from(tableName)
          .select('id, nom_complet, role, identifiant, "nom et prénom", rôle, full_name')
          .eq(tableName.includes('identifiant') ? 'identifiant' : 'id', userId)
          .maybeSingle();
        
        if (result.data) {
          data = result.data;
          break;
        }
      }

      if (!data) throw new Error('Profile not found in any known table');
      
      const mappedProfile: Profile = {
        id: data.id || data.identifiant,
        full_name: data.nom_complet || data["nom et prénom"] || data.full_name || 'User',
        role: (data.role || data.rôle) === 'professeur' || (data.role || data.rôle) === 'teacher' ? 'teacher' : 
               (data.role || data.rôle) === 'étudiant' || (data.role || data.rôle) === 'student' ? 'student' : 
               (data.role || data.rôle) === 'administrateur' || (data.role || data.rôle) === 'admin' ? 'admin' : 'parent' as any,
        student_id: data.id || data.identifiant
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
    
    // Bypass for test accounts to avoid OTP issues during development/demo
    const isTestAdmin = normalizedEmail === 'douliagroup@gmail.com' || normalizedEmail === 'douliagroup.com';
    const isTestParent = normalizedEmail === 'marcbagnack@gmail.com';

    if (isTestAdmin || isTestParent) {
      const mockUser = { 
        id: isTestAdmin ? 'admin-id-mock' : 'parent-id-mock', 
        email: normalizedEmail 
      };
      const mockProfile: Profile = {
        id: mockUser.id,
        full_name: isTestAdmin ? 'Administrateur Dewey' : 'Marc Bagnack (Parent)',
        role: isTestAdmin ? 'admin' : 'parent',
        student_id: isTestAdmin ? undefined : '04c5c05d-6811-4134-a7a5-1dd487ef71f7' // Oben Kotto's ID from screenshot for demo
      };

      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('dewey_mock_session', JSON.stringify({ user: mockUser, profile: mockProfile }));
      setLoading(false);
      return;
    }
    
    // Only use mock sign in if Supabase is NOT configured
    const isConfigured = import.meta.env.VITE_SUPABASE_URL && 
                        import.meta.env.VITE_SUPABASE_URL.startsWith('http');

    if (!isConfigured) {
      const isAdmin = normalizedEmail === 'douliagroup@gmail.com' || normalizedEmail === 'douliagroup.com';
      const mockUser = { id: isAdmin ? 'admin-id' : 'mock-id', email: normalizedEmail };
      setUser(mockUser);
      const mockProfile: Profile = {
        id: isAdmin ? 'admin-id' : 'mock-id',
        full_name: isAdmin ? 'Administrator' : 'Parent Demo',
        role: isAdmin ? 'admin' : 'parent',
        student_id: isAdmin ? undefined : 'child-123'
      };
      setProfile(mockProfile);
      localStorage.setItem('dewey_mock_session', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email: normalizedEmail });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('dewey_mock_session');
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signIn, signOut };
}
