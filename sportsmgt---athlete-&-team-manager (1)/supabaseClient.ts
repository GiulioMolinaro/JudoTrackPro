import { createClient } from '@supabase/supabase-js';

// NOTE: In a real deployment, these would come from process.env
// Quotes added to fix syntax error
const supabaseUrl = "https://zjezlaprhvcrxoxpnmev.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZXpsYXByaHZjcnhveHBubWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzk1MjgsImV4cCI6MjA4NTYxNTUyOH0.MbxDf4ItBAmiX3dNpxky4daalgvQ5-W2sn43ePSn2bI";

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

// We use a dummy URL if missing to prevent the "supabaseUrl is required" error during initialization.
// The isSupabaseConfigured check in the UI handles the actual state.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);