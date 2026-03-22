import { createClient } from '@supabase/supabase-js';

// Use placeholders if environment variables are not set to prevent initialization errors.
// The app guards actual usage with checks for these variables.
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure we have a valid URL format for the SDK
const supabaseUrl = (rawUrl && rawUrl.startsWith('http')) 
  ? rawUrl 
  : 'https://placeholder-project.supabase.co';

const supabaseAnonKey = rawKey || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
