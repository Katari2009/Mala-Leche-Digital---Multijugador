
/**
 * API: /api/rooms/join-room
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.7';

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

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
    const { roomId, playerName } = await req.json();

    if (!roomId || !playerName) {
      return new Response(JSON.stringify({ error: 'Falta código o nombre.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanRoomId = roomId.toUpperCase().trim();

    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('id, status')
      .eq('id', cleanRoomId)
      .single();

    if (roomError || !room) {
      return new Response(JSON.stringify({ error: 'La sala no existe.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: player, error: playerError } = await supabase
      .from('room_players')
      .insert([
        { 
          room_id: cleanRoomId, 
          name: playerName,
          lucas: 10,
          is_dealer: false,
          hand: [] 
        }
      ])
      .select()
      .single();

    if (playerError) throw playerError;

    return new Response(JSON.stringify({ 
      message: '¡Te uniste con éxito!',
      player: player,
      roomId: cleanRoomId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Error interno:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
