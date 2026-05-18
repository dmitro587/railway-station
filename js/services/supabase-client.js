// ========== SUPABASE КЛІЄНТ ==========
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://rvngppzmkhwwbdnauduo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2wv2wpymRS-9NcFyqCFWDA_aSUwASzY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Отримання маршрутів з Supabase
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

// Додавання маршруту
export async function addRouteToSupabase(route) {
    const { data, error } = await supabase
        .from('routes')
        .insert([{
            from_city: route.from,
            to_city: route.to,
            time: route.time,
            price: route.price,
            duration: route.duration,
            distance: route.distance,
            rating: route.rating || 0,
            stops: route.stops || []
        }])
        .select();
    
    if (error) throw new Error(error.message);
    return data[0];
}

// Оновлення маршруту
export async function updateRouteInSupabase(id, route) {
    const { data, error } = await supabase
        .from('routes')
        .update({
            from_city: route.from,
            to_city: route.to,
            time: route.time,
            price: route.price,
            duration: route.duration,
            distance: route.distance,
            rating: route.rating,
            stops: route.stops
        })
        .eq('id', id)
        .select();
    
    if (error) throw new Error(error.message);
    return data[0];
}

// Видалення маршруту
export async function deleteRouteFromSupabase(id) {
    const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
}
