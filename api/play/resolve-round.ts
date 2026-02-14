
/**
 * API: /api/play/resolve-round
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
    const { roomId, dealerId, winnerId, loserId, potAmount, gameHistoryId } = await req.json();

    if (!roomId || !dealerId || !winnerId || !loserId) {
      return new Response(JSON.stringify({ error: 'Faltan datos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: room, error: roomError } = await supabase
      .from('game_rooms')
      .select('dealer_id, status, current_round')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return new Response(JSON.stringify({ error: 'La sala no existe.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (room.dealer_id !== dealerId) {
      return new Response(JSON.stringify({ error: 'No eres el Dealer.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: players, error: playersError } = await supabase
      .from('room_players')
      .select('id, lucas')
      .in('id', [winnerId, loserId]);

    if (playersError || !players || players.length < 1) {
      return new Response(JSON.stringify({ error: 'No encontramos a los jugadores.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const winner = players.find(p => p.id === winnerId);
    const loser = players.find(p => p.id === loserId);

    if (winner) {
      await supabase
        .from('room_players')
        .update({ lucas: (winner.lucas || 0) + (potAmount || 0) })
        .eq('id', winnerId);
    }

    if (loser) {
      const newLoserLucas = Math.max(0, (loser.lucas || 0) - 1);
      await supabase
        .from('room_players')
        .update({ lucas: newLoserLucas })
        .eq('id', loserId);
    }

    if (gameHistoryId) {
      await supabase
        .from('game_history')
        .update({
          winner_id: winnerId,
          loser_id: loserId,
          pot_awarded: potAmount
        })
        .eq('id', gameHistoryId);
    } else {
      await supabase
        .from('game_history')
        .insert([{
          room_id: roomId,
          round_number: room.current_round,
          white_cards: [], 
          winner_id: winnerId,
          loser_id: loserId,
          pot_awarded: potAmount
        }]);
    }

    const { data: updatedRoom, error: updateRoomError } = await supabase
      .from('game_rooms')
      .update({
        status: 'RESOLVING',
        pot: 0,
        current_round: room.current_round + 1
      })
      .eq('id', roomId)
      .select()
      .single();

    if (updateRoomError) throw updateRoomError;

    return new Response(JSON.stringify({ 
      success: true, 
      message: '¡Ronda resuelta!',
      updatedGameState: updatedRoom
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Error en resolve-round:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
