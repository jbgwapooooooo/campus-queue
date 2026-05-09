import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://toayrzzqhnspxhkaljwm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0o84rUOebxJBHImPwKt-4Q_XRJzTlzA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
