-- Create Enum for Feature Status (if not exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feature_status') THEN 
        CREATE TYPE feature_status AS ENUM ('planned', 'in_progress', 'live', 'archived'); 
    END IF; 
END $$;

-- Create Roadmap Features Table
CREATE TABLE IF NOT EXISTS roadmap_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status feature_status DEFAULT 'planned',
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Feature Votes Table
CREATE TABLE IF NOT EXISTS feature_votes (
    feature_id UUID REFERENCES roadmap_features(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (feature_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE roadmap_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Drop if exists to avoid conflicts)

-- 1. Roadmap Features: Public Read
DROP POLICY IF EXISTS "Public View Roadmap" ON roadmap_features;
CREATE POLICY "Public View Roadmap" 
ON roadmap_features FOR SELECT 
TO public 
USING (true);

-- 2. Feature Votes: View own votes
DROP POLICY IF EXISTS "View Own Votes" ON feature_votes;
CREATE POLICY "View Own Votes" 
ON feature_votes FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Feature Votes: Insert/Delete own votes
DROP POLICY IF EXISTS "Manage Own Votes" ON feature_votes;
CREATE POLICY "Manage Own Votes" 
ON feature_votes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Delete Own Votes" ON feature_votes;
CREATE POLICY "Delete Own Votes" 
ON feature_votes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Function to Auto-Update Vote Counts
CREATE OR REPLACE FUNCTION update_roadmap_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE roadmap_features SET votes_count = votes_count + 1 WHERE id = NEW.feature_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE roadmap_features SET votes_count = votes_count - 1 WHERE id = OLD.feature_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Vote Counts
DROP TRIGGER IF EXISTS trigger_update_roadmap_votes ON feature_votes;
CREATE TRIGGER trigger_update_roadmap_votes
AFTER INSERT OR DELETE ON feature_votes
FOR EACH ROW EXECUTE FUNCTION update_roadmap_votes_count();
