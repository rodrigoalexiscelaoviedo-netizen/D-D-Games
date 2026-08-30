-- Create creatures table for bestiario
CREATE TABLE IF NOT EXISTS creatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  size TEXT,
  cr NUMERIC NOT NULL,
  hp INTEGER NOT NULL,
  ac INTEGER NOT NULL,
  str INTEGER,
  dex INTEGER,
  con INTEGER,
  int INTEGER,
  wis INTEGER,
  cha INTEGER,
  speed TEXT,
  abilities TEXT,
  actions TEXT,
  reactions TEXT,
  languages TEXT,
  damage_resistances TEXT,
  damage_immunities TEXT,
  source TEXT DEFAULT 'custom',
  open5e_index TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster searching
CREATE INDEX IF NOT EXISTS idx_creatures_name ON creatures USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_creatures_type ON creatures(type);
CREATE INDEX IF NOT EXISTS idx_creatures_cr ON creatures(cr);
CREATE INDEX IF NOT EXISTS idx_creatures_source ON creatures(source);

-- Enable full-text search
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read creatures
CREATE POLICY "Creatures are readable by everyone"
  ON creatures FOR SELECT
  USING (true);

-- RLS Policy: Only authenticated users can create creatures
CREATE POLICY "Authenticated users can create creatures"
  ON creatures FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policy: Only owners can update/delete creatures
CREATE POLICY "Users can update their own creatures"
  ON creatures FOR UPDATE
  USING (source = 'custom' OR auth.role() = 'service_role')
  WITH CHECK (source = 'custom' OR auth.role() = 'service_role');
