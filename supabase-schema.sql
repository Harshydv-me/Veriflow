-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'marketplace', 'admin')),
  wallet_address TEXT,
  organization TEXT,
  phone TEXT,
  avatar TEXT,
  bio TEXT,
  location JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{"language": "en", "currency": "USD", "notifications": true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  ecosystem_type TEXT CHECK (ecosystem_type IN ('Mangrove', 'Seagrass', 'Salt Marsh', 'Wetland', 'Other')),
  area DECIMAL(10, 2),
  location JSONB NOT NULL,
  boundaries JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'active', 'rejected')),
  estimated_credits DECIMAL(10, 2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- FIELD DATA TABLE
-- =============================================
CREATE TABLE field_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data_id TEXT UNIQUE NOT NULL,
  project_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  collector TEXT NOT NULL,
  measurements JSONB DEFAULT '{}',
  location JSONB NOT NULL,
  images JSONB DEFAULT '{"before": [], "after": [], "progress": []}',
  ipfs_hash TEXT,
  ipfs_url TEXT,
  blockchain_tx_hash TEXT,
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUBMISSIONS TABLE
-- =============================================
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id TEXT UNIQUE NOT NULL,
  project_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  field_data_id UUID REFERENCES field_data(id),

  -- Tree measurements
  measurements JSONB DEFAULT '{}',

  -- Location with GPS accuracy
  location JSONB NOT NULL,

  -- Categorized images
  images JSONB DEFAULT '{"mangrove": [], "area": [], "monitoring": []}',

  -- Documents
  documents JSONB DEFAULT '[]',

  notes TEXT,

  -- Status and review
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  admin_feedback TEXT,

  -- Blockchain
  ipfs_hash TEXT,
  blockchain_tx_hash TEXT,

  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  project_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'custom' CHECK (type IN ('daily', 'weekly', 'monthly', 'custom')),
  completed BOOLEAN DEFAULT FALSE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT,
  related_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CARBON CREDITS TABLE
-- =============================================
CREATE TABLE carbon_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_id TEXT UNIQUE NOT NULL,
  project_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'retired')),
  vintage INTEGER NOT NULL,
  verification_standard TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  blockchain_token_id TEXT,
  blockchain_tx_hash TEXT,
  metadata JSONB DEFAULT '{}',
  current_owner UUID REFERENCES users(id),
  purchase_history JSONB DEFAULT '[]',
  retired_at TIMESTAMPTZ,
  retired_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WALLET TABLE
-- =============================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  address TEXT UNIQUE NOT NULL,
  balance JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tx_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mint', 'burn', 'transfer', 'purchase', 'deposit', 'withdraw')),
  amount DECIMAL(10, 2) NOT NULL,
  token_symbol TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  blockchain_tx_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_field_data_user_id ON field_data(user_id);
CREATE INDEX idx_field_data_project_id ON field_data(project_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_project_id ON submissions(project_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_carbon_credits_status ON carbon_credits(status);
CREATE INDEX idx_carbon_credits_user_id ON carbon_credits(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_field_data_updated_at BEFORE UPDATE ON field_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carbon_credits_updated_at BEFORE UPDATE ON carbon_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Anyone can view verified projects" ON projects
  FOR SELECT USING (status = 'verified' OR status = 'active');

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = created_by);

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Admins can update submissions
CREATE POLICY "Admins can update submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Carbon Credits policies
CREATE POLICY "Anyone can view available credits" ON carbon_credits
  FOR SELECT USING (status = 'available');

CREATE POLICY "Users can view their own credits" ON carbon_credits
  FOR SELECT USING (auth.uid() = current_owner);

-- Wallets policies
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate submission ID
CREATE OR REPLACE FUNCTION generate_submission_id()
RETURNS TEXT AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) INTO count FROM submissions;
  RETURN 'SUB-' || LPAD((count + 1)::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to get task statistics
CREATE OR REPLACE FUNCTION get_task_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'completed', COUNT(*) FILTER (WHERE completed = TRUE),
    'pending', COUNT(*) FILTER (WHERE completed = FALSE),
    'daily', COUNT(*) FILTER (WHERE type = 'daily'),
    'weekly', COUNT(*) FILTER (WHERE type = 'weekly'),
    'monthly', COUNT(*) FILTER (WHERE type = 'monthly')
  )
  INTO result
  FROM tasks
  WHERE user_id = p_user_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;
