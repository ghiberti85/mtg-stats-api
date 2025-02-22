import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = 'your-supabase-url';
const SUPABASE_KEY: string = 'your-supabase-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface SupabaseAuthClient {
  signUp: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ user: any; session: any; error: any }>;
  signIn: (credentials: {
    email: string;
    password: string;
  }) => Promise<{ user: any; session: any; error: any }>;
}

function createClient(SUPABASE_URL: string, SUPABASE_KEY: string) {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
}
