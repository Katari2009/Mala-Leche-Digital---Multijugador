# Guía de Implementación Multijugador: Mala Leche Digital

Esta guía detalla los pasos realizados y las integraciones necesarias para transformar el prototipo local en una aplicación multijugador robusta utilizando **Next.js API Routes** (Serverless) y **Supabase** (Base de Datos + Realtime).

## 1. Resumen de Archivos Creados (Fases 1-6)

### Backend & Base de Datos
- `db/schema.sql`: Definición de tablas, tipos ENUM e índices para PostgreSQL.
- `types/database.ts`: Interfaces de TypeScript que espejan el esquema de la base de datos.
- `api/create-room.ts`: Endpoint para inicializar salas y el primer Dealer.
- `api/rooms/join-room.ts`: Lógica para que nuevos jugadores entren vía código de 6 dígitos.
- `api/play/submit-card.ts`: Registro anónimo de cartas jugadas por los participantes.
- `api/play/resolve-round.ts`: Selección del ganador/perdedor y transferencia de LUCAS.
- `api/history/stats.ts`: Motor de consulta para bitácora y rankings.

### Frontend & Hooks
- `hooks/useRoomRealtime.ts`: Hook que sincroniza el estado global de la sala y jugadores automáticamente.
- `components/RoomCodeScreen.tsx`: Interfaz de bienvenida (Crear vs Unirse).
- `components/GameHistoryModal.tsx`: Dashboard de estadísticas y últimas rondas.

## 2. Configuración en Supabase

Para que el backend funcione, sigue estos pasos en tu proyecto de Supabase:

1. **SQL Editor**: Copia y pega el contenido de `db/schema.sql` y ejecútalo. Esto creará la estructura necesaria.
2. **Realtime**: Ve a la configuración de la base de datos y asegúrate de habilitar el servicio Realtime para las tablas `game_rooms` y `room_players`.
3. **Policies (RLS)**: Por simplicidad en esta fase, puedes desactivar RLS o crear políticas que permitan lectura/escritura pública filtrada por `room_id`.

## 3. Flujo de Juego Multijugador

1. **Host**: Crea la sala seleccionando un modo (ej: `AULA`). Recibe un código (ej: `H7K2P1`).
2. **Jugadores**: Ingresan su nombre y el código de sala.
3. **Sincronización**: El hook `useRoomRealtime` mantiene a todos en la misma fase (`LOBBY`, `PLAYING`, etc.).
4. **Fase de Juego**:
   - El Dealer ve las blancas.
   - Los jugadores llaman a `/api/play/submit-card`.
   - Cuando todos están listos, el estado de la sala cambia a `REVEALING`.
5. **Resolución**:
   - El Dealer elige al ganador.
   - Se llama a `/api/play/resolve-round`.
   - Se actualizan las Lucas y se registra en `game_history`.

## 4. Integraciones Pendientes en el Código

Para activar el modo multijugador completo en `App.tsx`, realiza estos cambios:

- **Reemplazo de Setup**: Cambia `<SetupScreen />` por `<RoomCodeScreen onRoomJoined={...} />`.
- **Botón de Historial**: Añade un botón en el header para abrir el `GameHistoryModal`.
- **Acciones de API**: Las funciones locales como `playCard` y `resolveRound` deben ser reemplazadas por llamadas `fetch` a sus respectivos endpoints en `/api/play/...`.
- **Gestión de Mano**: Actualmente la mano es local. Para persistencia real entre dispositivos, se debe integrar el campo `hand` de `room_players`.

## 5. Variables de Entorno

Asegúrate de configurar estas variables en tu entorno de desarrollo (`.env`) y en el panel de **Vercel**:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

## 6. Próximos Pasos & Mejoras

- **Mecánica de Lucas**: Implementar el gasto de 1 LUCA para cambiar mano o 2 LUCAS para jugada doble.
- **Temporizadores**: Añadir una cuenta regresiva para que los "lentos" no bloqueen la ronda.
- **Chat**: Integrar un chat rápido con frases chilenas predefinidas.
- **Audio**: Usar la API de Gemini para narrar las cartas ganadoras con "voz de profesor chileno".

---
*Desarrollado para la comunidad educativa. ¡Buena suerte con la mambo!*
