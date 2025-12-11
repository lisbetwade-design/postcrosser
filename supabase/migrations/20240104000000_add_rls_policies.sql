-- Enable Row Level Security on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles (for finding recipients)
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Enable Row Level Security on postcards table
ALTER TABLE postcards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read postcards they sent or received
CREATE POLICY "Users can read own postcards"
  ON postcards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Policy: Users can insert postcards they send
CREATE POLICY "Users can insert own postcards"
  ON postcards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update postcards they received (to mark as read)
CREATE POLICY "Users can update received postcards"
  ON postcards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = recipient_id);

