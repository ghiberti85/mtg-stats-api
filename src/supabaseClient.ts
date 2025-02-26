import 'dotenv/config'; // 🔹 Garante o carregamento do .env

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ✅ Obtém as variáveis corretamente
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('⚠️ SUPABASE_URL e SUPABASE_KEY não estão definidas no .env');
}

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
);
