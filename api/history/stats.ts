
/**
 * API: /api/history/stats
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.7';

const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
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

  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId');

  if (!roomId) {
    return new Response(JSON.stringify({ error: 'Falta roomId.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data: historyData, error: historyError } = await supabase
      .from('game_history')
      .select('*')
      .eq('room_id', roomId)
      .order('round_number', { ascending: false })
      .limit(10);

    if (historyError) throw historyError;

    const { data: playersData, error: playersError } = await supabase
      .from('room_players')
      .select('id, name')
      .eq('room_id', roomId);

    if (playersError) throw playersError;

    const playerMap = new Map(playersData.map((p: any) => [p.id, p.name]));

    const history = (historyData || []).map((record: any) => ({
      round_number: record.round_number,
      white_cards: record.white_cards,
      winner_name: playerMap.get(record.winner_id) || 'Jugador Fugado',
      loser_name: playerMap.get(record.loser_id) || 'Jugador Fugado',
      pot_awarded: record.pot_awarded,
      dealer_name: 'Anónimo'
    }));

    const statsMap: Record<string, { wins: number, losses: number, total_lucas: number }> = {};
    playersData.forEach((p: any) => {
      statsMap[p.id] = { wins: 0, losses: 0, total_lucas: 0 };
    });

    const { data: fullHistory } = await supabase
      .from('game_history')
      .select('winner_id, loser_id, pot_awarded')
      .eq('room_id', roomId);

    (fullHistory || []).forEach((record: any) => {
      if (record.winner_id && statsMap[record.winner_id]) {
        statsMap[record.winner_id].wins += 1;
        statsMap[record.winner_id].total_lucas += record.pot_awarded;
      }
      if (record.loser_id && statsMap[record.loser_id]) {
        statsMap[record.loser_id].losses += 1;
      }
    });

    const stats = Object.entries(statsMap).map(([id, data]) => ({
      name: playerMap.get(id) || 'Desconocido',
      ...data
    })).sort((a, b) => b.total_lucas - a.total_lucas);

    return new Response(JSON.stringify({ history, stats }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Error en history/stats:', err);
    return new Response(JSON.stringify({ error: err.message || 'Error interno.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
