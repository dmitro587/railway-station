// Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://rvngppzmkhwwbdnauduo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2wv2wpymRS-9NcFyqCFWDA_aSUwASzY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchRoutesFromSupabase() {
    const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('id');
    
    if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
    }
    
    return data || [];
}
