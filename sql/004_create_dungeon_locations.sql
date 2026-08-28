-- Dungeon locations table for campaign planning
CREATE TABLE IF NOT EXISTS dungeon_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  threats text,
  treasure text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, name)
);

-- RLS Policies
ALTER TABLE dungeon_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see locations of their campaigns" ON dungeon_locations
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can insert locations" ON dungeon_locations
  FOR INSERT WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can update locations" ON dungeon_locations
  FOR UPDATE USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Campaign owners can delete locations" ON dungeon_locations
  FOR DELETE USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );
