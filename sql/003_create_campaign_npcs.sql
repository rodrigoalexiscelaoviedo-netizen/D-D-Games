-- Campaign NPCs table
CREATE TABLE IF NOT EXISTS campaign_npcs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text DEFAULT 'NPC',
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, name)
);

-- RLS Policies
ALTER TABLE campaign_npcs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see NPCs of their campaigns" ON campaign_npcs
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can insert NPCs" ON campaign_npcs
  FOR INSERT WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can update NPCs" ON campaign_npcs
  FOR UPDATE USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can delete NPCs" ON campaign_npcs
  FOR DELETE USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );
