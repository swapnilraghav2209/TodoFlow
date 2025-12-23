import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxtfawnrjokwwwskjslu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dGZhd25yam9rd3d3c2tqc2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODQ3ODEsImV4cCI6MjA4MjA2MDc4MX0.fYKoFQob1A_Cy4kA7EMM1SxKb4PtVJRtOA3J67wgwzo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Todo = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  is_recurring: boolean;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | null;
  recurrence_interval: number | null;
  next_occurrence: string | null;
  created_at: string;
  updated_at: string;
};

export type Attachment = {
  id: string;
  todo_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
};
