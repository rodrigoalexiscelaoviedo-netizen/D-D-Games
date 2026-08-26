-- idempotent: create table playthrough_participants
CREATE TABLE IF NOT EXISTS playthrough_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playthrough_id uuid NOT NULL REFERENCES playthroughs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id uuid REFERENCES characters(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'player' CHECK (role IN ('dm', 'player')),
  confirmed boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_playthrough_participants_unique
  ON playthrough_participants (playthrough_id, user_id);

-- RLS
ALTER TABLE playthrough_participants ENABLE ROW LEVEL SECURITY;

-- policy: DM de playthrough puede ver todos los participantes
CREATE POLICY "playthrough_participants_dm_read" ON playthrough_participants
  FOR SELECT
  USING (
    playthrough_id IN (
      SELECT id FROM playthroughs
      WHERE user_id = auth.uid()
    )
  );

-- policy: jugador puede ver solo su propia fila
CREATE POLICY "playthrough_participants_player_read" ON playthrough_participants
  FOR SELECT
  USING (user_id = auth.uid());

-- policy: DM puede insertar/actualizar participantes
CREATE POLICY "playthrough_participants_dm_write" ON playthrough_participants
  FOR INSERT
  WITH CHECK (
    playthrough_id IN (
      SELECT id FROM playthroughs
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "playthrough_participants_dm_update" ON playthrough_participants
  FOR UPDATE
  USING (
    playthrough_id IN (
      SELECT id FROM playthroughs
      WHERE user_id = auth.uid()
    )
  );

-- policy: jugador puede actualizar solo su propia fila (confirmar personaje)
CREATE POLICY "playthrough_participants_player_update" ON playthrough_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
