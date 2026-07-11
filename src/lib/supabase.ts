import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://sqkzityjfxwuescwvrph.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxa3ppdHlqZnh3dWVzY3d2cnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMjYyOTIsImV4cCI6MjA5ODkwMjI5Mn0.xhYOyFrAlYDtZbhJZpb-6zkewc8fW42J1vNrc8AW67g'
);

export type Quiz = {
  id: string;
  title: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
};

export type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  created_at: string;
};

export type BrowserInfo = {
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  screen: string;
  language: string;
  platform: string;
};

export type LocationInfo = {
  ip: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
};

export type LeaderboardEntry = {
  id: string;
  student_name: string;
  score: number;
  quiz_id: string;
  created_at: string;
  ip_address: string | null;
  browser_info: BrowserInfo | null;
  location: LocationInfo | null;
  quizzes?: { title: string };
};
