import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Only initialize if credentials are provided
let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  // Create Supabase client with service role key for backend
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✓ Supabase client initialized');
} else {
  console.log('⚠️  Supabase credentials not provided - using MongoDB only');
}

export { supabase };
export default supabase;
