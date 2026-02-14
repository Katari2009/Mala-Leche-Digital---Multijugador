
/**
 * API: /api/create-room
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.7';

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

function generateRoomCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(req: any) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Configuración de base de datos no encontrada.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, mode } = await req.json();

    if (!name || !mode) {
      return new Response(JSON.stringify({ error: 'Falta nombre o modo.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let roomCode = generateRoomCode();
    
    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .insert([{ 
        id: roomCode, 
        status: 'LOBBY', 
        mode: mode, 
        pot: 0,
        current_round: 0
      }])
      .select()
      .single();

    if (roomError) throw roomError;

    const { data: player, error: playerError } = await supabase
      .from('room_players')
      .insert([{ 
        room_id: roomCode, 
        name: name,
        lucas: 10,
        is_dealer: true,
        hand: [] 
      }])
      .select()
      .single();

    if (playerError) throw playerError;

    await supabase
      .from('game_rooms')
      .update({ dealer_id: player.id })
      .eq('id', roomCode);

    return new Response(JSON.stringify({ 
      roomCode: roomCode,
      roomId: roomCode,
      dealerPlayerId: player.id,
      player: player,
      message: '¡Sala creada!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Error fatal en create-room:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
