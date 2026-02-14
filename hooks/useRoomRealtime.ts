
import { useState, useEffect } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.39.7';
import { RoomPlayer, GameRoom } from '../types/database';

// Helper para obtener el cliente de Supabase de forma segura
const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  try {
    return createClient(url, key);
  } catch (e) {
    console.error("Error al inicializar Supabase:", e);
    return null;
  }
};

/**
 * Hook para suscribirse a los cambios de una sala específica en Supabase Realtime.
 * @param roomId El código/ID de la sala a monitorear.
 */
export const useRoomRealtime = (roomId: string | null) => {
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setPlayers([]);
      setRoom(null);
      setError(null);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Falta la configuración de Supabase (URL/Key). Revisa tus variables de entorno.');
      return;
    }

    // 1. Cargar estado inicial desde la DB
    const fetchInitialData = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        const { data: playersData, error: playersError } = await supabase
          .from('room_players')
          .select('*')
          .eq('room_id', roomId);

        if (roomError) throw roomError;
        if (playersError) throw playersError;

        setRoom(roomData);
        setPlayers(playersData || []);
      } catch (err: any) {
        console.error('Error inicializando Realtime:', err);
        setError('No se pudo conectar con la sala. Revisa tu conexión.');
      }
    };

    fetchInitialData();

    // 2. Configurar el canal de Realtime para esta sala
    const channel = supabase.channel(`room_sync:${roomId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_rooms', 
          filter: `id=eq.${roomId}` 
        },
        (payload) => {
          setRoom(payload.new as GameRoom);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'room_players', 
          filter: `room_id=eq.${roomId}` 
        },
        async () => {
          const { data } = await supabase
            .from('room_players')
            .select('*')
            .eq('room_id', roomId);
          setPlayers(data || []);
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setError('Error de conexión Realtime. Los cambios podrían no verse reflejados.');
        }
      });

    // 3. Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { players, room, error };
};
