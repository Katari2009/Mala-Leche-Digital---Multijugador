
/**
 * API: /api/play/submit-card
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.7';

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export default async function handler(req: Request) {
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
    const { roomId, playerId, cardId, roundNumber } = await req.json();

    if (!roomId || !playerId || !cardId || roundNumber === undefined) {
      return new Response(JSON.stringify({ error: 'Faltan datos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('id, status, dealer_id, current_round')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return new Response(JSON.stringify({ error: 'La sala no existe.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (room.status !== 'PLAYING') {
      return new Response(JSON.stringify({ error: 'No es momento de jugar.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (room.dealer_id === playerId) {
      return new Response(JSON.stringify({ error: 'El dealer no juega cartas.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error: playError } = await supabase
      .from('played_cards')
      .insert([
        {
          room_id: roomId,
          player_id: playerId,
          round_number: roundNumber,
          card_id: cardId,
          is_revealed: false
        }
      ]);

    if (playError) {
      if (playError.code === '23505') {
        return new Response(JSON.stringify({ error: 'Ya jugaste una carta.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw playError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: '¡Carta lanzada!' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Error fatal en submit-card:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
