import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

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
