-- Row Level Security (RLS) Policies
-- Run this after 001_initial_schema.sql

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'ADMIN'
    )
  );

-- Admins can insert users (via Edge Function)
CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'ADMIN'
    )
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (
    auth.uid()::text = id::text
    AND role = (SELECT role FROM users WHERE id::text = auth.uid()::text)
  );

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

-- Users can read projects they created
CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  USING (created_by::text = auth.uid()::text);

-- Users can read projects assigned to them
CREATE POLICY "Users can read assigned projects"
  ON projects FOR SELECT
  USING (assigned_to::text = auth.uid()::text);

-- CMO and CEO can read all projects
CREATE POLICY "CMO and CEO can read all projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('CMO', 'CEO', 'ADMIN')
    )
  );

-- Writers can create projects
CREATE POLICY "Writers can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('WRITER', 'ADMIN')
    )
    AND created_by::text = auth.uid()::text
  );

-- Users can update projects they created or are assigned to
CREATE POLICY "Users can update their projects"
  ON projects FOR UPDATE
  USING (
    created_by::text = auth.uid()::text
    OR assigned_to::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role IN ('CMO', 'CEO', 'ADMIN')
    )
  );

-- ============================================================================
-- PROJECT_DATA TABLE POLICIES
-- ============================================================================

-- Project data follows same rules as projects
CREATE POLICY "Users can read project data for accessible projects"
  ON project_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_data.project_id
      AND (
        p.created_by::text = auth.uid()::text
        OR p.assigned_to::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id::text = auth.uid()::text
          AND u.role IN ('CMO', 'CEO', 'ADMIN')
        )
      )
    )
  );

CREATE POLICY "Users can insert project data for their projects"
  ON project_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_data.project_id
      AND (
        p.created_by::text = auth.uid()::text
        OR p.assigned_to::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Users can update project data for their projects"
  ON project_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_data.project_id
      AND (
        p.created_by::text = auth.uid()::text
        OR p.assigned_to::text = auth.uid()::text
      )
    )
  );

-- ============================================================================
-- WORKFLOW_HISTORY TABLE POLICIES
-- ============================================================================

-- Anyone can read workflow history for projects they can access
CREATE POLICY "Users can read workflow history for accessible projects"
  ON workflow_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = workflow_history.project_id
      AND (
        p.created_by::text = auth.uid()::text
        OR p.assigned_to::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id::text = auth.uid()::text
          AND u.role IN ('CMO', 'CEO', 'ADMIN')
        )
      )
    )
  );

-- Users can insert workflow history for projects they can access
CREATE POLICY "Users can insert workflow history for their projects"
  ON workflow_history FOR INSERT
  WITH CHECK (
    actor_id::text = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = workflow_history.project_id
      AND (
        p.created_by::text = auth.uid()::text
        OR p.assigned_to::text = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id::text = auth.uid()::text
          AND u.role IN ('CMO', 'CEO', 'ADMIN')
        )
      )
    )
  );

-- ============================================================================
-- SYSTEM_LOGS TABLE POLICIES
-- ============================================================================

-- Only admins can read system logs
CREATE POLICY "Admins can read system logs"
  ON system_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'ADMIN'
    )
  );

-- Anyone can insert their own logs
CREATE POLICY "Users can insert own logs"
  ON system_logs FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text OR user_id IS NULL);

-- ============================================================================
-- FUNCTIONS FOR ROLE-BASED ACCESS
-- ============================================================================

-- Helper function to check if current user has a specific role
CREATE OR REPLACE FUNCTION has_role(check_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id::text = auth.uid()::text
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can access a project
CREATE OR REPLACE FUNCTION can_access_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects p
    LEFT JOIN users u ON u.id::text = auth.uid()::text
    WHERE p.id = project_uuid
    AND (
      p.created_by::text = auth.uid()::text
      OR p.assigned_to::text = auth.uid()::text
      OR u.role IN ('CMO', 'CEO', 'ADMIN')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log the RLS migration
INSERT INTO system_logs (action, details) VALUES
  ('schema_migration', '{"version": "002", "description": "Row Level Security policies"}');
