-- Create user_favorites table for marketplace favorites functionality
CREATE TABLE IF NOT EXISTS user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id BIGINT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('service', 'product')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  
  -- Ensure unique combinations of user_id, listing_id, and listing_type
  UNIQUE(user_id, listing_id, listing_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_listing ON user_favorites(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites
FOR SELECT USING (auth.uid() = user_id);

-- Users can only add to their own favorites
CREATE POLICY "Users can add their own favorites" ON user_favorites
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites" ON user_favorites
FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_user_favorites_updated_at 
    BEFORE UPDATE ON user_favorites 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();