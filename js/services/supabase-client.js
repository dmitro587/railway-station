// ========== SUPABASE КЛІЄНТ ==========
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ⚠️ ЗАМІНИ ЦІ ДВА РЯДКИ НА СВОЇ ДАНІ ⚠️
const SUPABASE_URL = 'https://rvngppzmkhvwbdnauduo;      
const SUPABASE_ANON_KEY = 'sb_publishable_2wv2wpymRS-9NcFyqCFWDA_aSUwASzY';  

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Функція для отримання маршрутів з Supabase
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

// Функція для додавання маршруту в Supabase
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

// Функція для оновлення маршруту
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

// Функція для видалення маршруту
export async function deleteRouteFromSupabase(id) {
    const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
    return true;
}
