import { createClient } from '@supabase/supabase-js';

// Ambil environment variables yang sudah kita set di file .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Buat dan ekspor client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);