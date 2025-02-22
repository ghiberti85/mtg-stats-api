// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase environment variables are missing!');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
