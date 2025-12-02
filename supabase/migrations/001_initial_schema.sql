-- Initial schema migration for Content Management System
-- Run this in your Supabase SQL Editor or via Supabase CLI

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'ADMIN',
  'WRITER',
  'CINE',
  'EDITOR',
  'DESIGNER',
  'CMO',
  'CEO',
  'OPS'
);

CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE channel_type AS ENUM ('LINKEDIN', 'YOUTUBE', 'INSTAGRAM');

CREATE TYPE content_type AS ENUM ('VIDEO', 'CREATIVE_ONLY');

CREATE TYPE workflow_stage AS ENUM (
  'SCRIPT',
  'SCRIPT_REVIEW_L1',
  'SCRIPT_REVIEW_L2',
  'CINEMATOGRAPHY',
  'VIDEO_EDITING',
  'THUMBNAIL_DESIGN',
  'CREATIVE_DESIGN',
  'FINAL_REVIEW_CMO',
  'FINAL_REVIEW_CEO',
  'OPS_SCHEDULING',
  'POSTED'
);

CREATE TYPE task_status AS ENUM (
  'TODO',
  'IN_PROGRESS',
  'WAITING_APPROVAL',
  'REJECTED',
  'DONE'
);

CREATE TYPE priority_type AS ENUM ('HIGH', 'NORMAL');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  status user_status DEFAULT 'ACTIVE'::user_status,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index on role for filtering dashboards
CREATE INDEX idx_users_role ON users(role);
-- Index on status for active user queries
CREATE INDEX idx_users_status ON users(status);
-- Index on email for auth lookups
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  channel channel_type NOT NULL,
  content_type content_type NOT NULL,
  current_stage workflow_stage NOT NULL DEFAULT 'SCRIPT'::workflow_stage,
  status task_status NOT NULL DEFAULT 'TODO'::task_status,
  priority priority_type DEFAULT 'NORMAL'::priority_type,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT due_date_future CHECK (due_date >= CURRENT_DATE)
);

-- Indexes for project queries
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_stage ON projects(current_stage);
CREATE INDEX idx_projects_channel ON projects(channel);
CREATE INDEX idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_due_date ON projects(due_date);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ============================================================================
-- PROJECT_DATA TABLE (for flexible stage-specific data storage)
-- ============================================================================

CREATE TABLE project_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage workflow_stage NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, stage)
);

-- Index for quick stage data lookups
CREATE INDEX idx_project_data_project_stage ON project_data(project_id, stage);

-- ============================================================================
-- WORKFLOW_HISTORY TABLE
-- ============================================================================

CREATE TABLE workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_stage workflow_stage,
  to_stage workflow_stage NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'submit', 'reassign')),
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for workflow history queries
CREATE INDEX idx_workflow_history_project ON workflow_history(project_id);
CREATE INDEX idx_workflow_history_timestamp ON workflow_history(timestamp DESC);
CREATE INDEX idx_workflow_history_actor ON workflow_history(actor_id);

-- ============================================================================
-- SYSTEM_LOGS TABLE
-- ============================================================================

CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for log queries (most recent first)
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_data_updated_at
  BEFORE UPDATE ON project_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (Optional - for testing)
-- ============================================================================

-- Insert demo users (passwords will be set via Supabase Auth)
INSERT INTO users (id, email, full_name, role, status) VALUES
  ('u1'::uuid, 'writer@applywizz.com', 'Alice Writer', 'WRITER', 'ACTIVE'),
  ('u2'::uuid, 'cmo@applywizz.com', 'Carol CMO', 'CMO', 'ACTIVE'),
  ('u3'::uuid, 'ceo@applywizz.com', 'Bob CEO', 'CEO', 'ACTIVE'),
  ('u4'::uuid, 'cine@applywizz.com', 'Dave Cine', 'CINE', 'ACTIVE'),
  ('u5'::uuid, 'editor@applywizz.com', 'Eve Editor', 'EDITOR', 'ACTIVE'),
  ('u6'::uuid, 'design@applywizz.com', 'Frank Design', 'DESIGNER', 'ACTIVE'),
  ('u7'::uuid, 'ops@applywizz.com', 'Grace Ops', 'OPS', 'ACTIVE'),
  ('u8'::uuid, 'admin@applywizz.com', 'Admin User', 'ADMIN', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- Log the migration
INSERT INTO system_logs (action, details) VALUES
  ('schema_migration', '{"version": "001", "description": "Initial schema creation"}');
