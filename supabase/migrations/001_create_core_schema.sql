-- ZAYRO CRM v1 — Core database migration
-- Run reproducibly on a Supabase/PostgreSQL instance.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Enums
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'rrpp', 'viewer');
CREATE TYPE preferred_day AS ENUM ('viernes', 'sabado', 'ambos');
CREATE TYPE event_day AS ENUM ('viernes', 'sabado', 'ambos');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE event_type AS ENUM ('club', 'private', 'social', 'community', 'vip');
CREATE TYPE group_type AS ENUM ('friends', 'university', 'connector', 'vip', 'other');
CREATE TYPE group_member_role AS ENUM ('leader', 'member');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'attended', 'cancelled', 'no_show');
CREATE TYPE reservation_type AS ENUM ('entry', 'vip', 'table', 'bottle', 'group');
CREATE TYPE attendance_status AS ENUM ('reserved', 'confirmed', 'attended', 'no_show', 'cancelled');
CREATE TYPE activity_type AS ENUM (
  'first_visit',
  'attendance',
  'brought_group',
  'vip_reservation',
  'repeat_vip',
  'new_referral',
  'high_frequency'
);
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');
CREATE TYPE commission_type AS ENUM ('entry', 'bottle', 'reservation', 'group', 'bonus');
CREATE TYPE segment_scope AS ENUM ('client', 'rrpp', 'event', 'group');
CREATE TYPE segment_status AS ENUM ('active', 'inactive');

-- ============================================================
-- Profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Universities
-- ============================================================

CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL DEFAULT 'Valencia',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Venues (clubs / salas)
-- ============================================================

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Valencia',
  instagram TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Clients
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  origin TEXT NOT NULL DEFAULT 'España',
  preferred_club UUID REFERENCES venues(id) ON DELETE SET NULL,
  preferred_day preferred_day NOT NULL DEFAULT 'viernes',
  frequency TEXT NOT NULL DEFAULT 'new',
  usual_group_size INTEGER NOT NULL DEFAULT 1 CHECK (usual_group_size >= 1),
  vip BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cold', 'blocked')),
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(phone),
  UNIQUE(email)
);

-- ============================================================
-- Segments and many-to-many client segment assignment
-- ============================================================

CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  scope segment_scope NOT NULL DEFAULT 'client',
  status segment_status NOT NULL DEFAULT 'active',
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS client_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, segment_id)
);

-- ============================================================
-- Groups
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  leader_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  usual_size INTEGER NOT NULL DEFAULT 1 CHECK (usual_size >= 1),
  type group_type NOT NULL DEFAULT 'friends',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  role group_member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(group_id, client_id, role)
);

-- ============================================================
-- RRPP profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS rrpp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  commission_type commission_type NOT NULL DEFAULT 'reservation',
  commission_value NUMERIC(5,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  start_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Events
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  event_date DATE NOT NULL,
  day_of_week event_day NOT NULL DEFAULT 'viernes',
  event_type event_type NOT NULL DEFAULT 'club',
  status event_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Reservations
-- ============================================================

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  rrpp_id UUID REFERENCES rrpp_profiles(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  people_count INTEGER NOT NULL DEFAULT 1 CHECK (people_count >= 1),
  reservation_type reservation_type NOT NULL DEFAULT 'entry',
  status reservation_status NOT NULL DEFAULT 'pending',
  table_number TEXT,
  estimated_spend NUMERIC(10,2) NOT NULL DEFAULT 0,
  actual_spend NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Attendance
-- ============================================================

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  rrpp_id UUID REFERENCES rrpp_profiles(id) ON DELETE SET NULL,
  status attendance_status NOT NULL DEFAULT 'reserved',
  people_count INTEGER NOT NULL DEFAULT 1 CHECK (people_count >= 1),
  spend NUMERIC(10,2) NOT NULL DEFAULT 0,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Client activity history
-- ============================================================

CREATE TABLE IF NOT EXISTS client_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  rrpp_id UUID REFERENCES rrpp_profiles(id) ON DELETE SET NULL,
  activity_type activity_type NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Commissions
-- ============================================================

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rrpp_id UUID NOT NULL REFERENCES rrpp_profiles(id) ON DELETE RESTRICT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
  commission_type commission_type NOT NULL DEFAULT 'reservation',
  base_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status commission_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);

CREATE INDEX IF NOT EXISTS idx_clients_first_last ON clients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_university ON clients(university_id);
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_clients_last_activity ON clients(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

CREATE INDEX IF NOT EXISTS idx_client_segments_client_id ON client_segments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_segments_segment_id ON client_segments(segment_id);

CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
CREATE INDEX IF NOT EXISTS idx_groups_university ON groups(university_id);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_client ON group_members(client_id);

CREATE INDEX IF NOT EXISTS idx_rrpp_profiles_profile ON rrpp_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_rrpp_profiles_active ON rrpp_profiles(active);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_reservations_event ON reservations(event_id);
CREATE INDEX IF NOT EXISTS idx_reservations_rrpp ON reservations(rrpp_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_type ON reservations(reservation_type);

CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_client ON attendance(client_id);
CREATE INDEX IF NOT EXISTS idx_attendance_reservation ON attendance(reservation_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

CREATE INDEX IF NOT EXISTS idx_client_activity_client ON client_activity(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activity_event ON client_activity(event_id);
CREATE INDEX IF NOT EXISTS idx_client_activity_rrpp ON client_activity(rrpp_id);

CREATE INDEX IF NOT EXISTS idx_commissions_rrpp ON commissions(rrpp_id);
CREATE INDEX IF NOT EXISTS idx_commissions_event ON commissions(event_id);
CREATE INDEX IF NOT EXISTS idx_commissions_reservation ON commissions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);

-- ============================================================
-- Common updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_universities_updated_at
BEFORE UPDATE ON universities
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_venues_updated_at
BEFORE UPDATE ON venues
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_segments_updated_at
BEFORE UPDATE ON segments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_rrpp_profiles_updated_at
BEFORE UPDATE ON rrpp_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_commissions_updated_at
BEFORE UPDATE ON commissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- RLS basics
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrpp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Helper role check
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Public tables: read access for any authenticated user; writes limited by app policies.
CREATE POLICY "profiles_select_authenticated" ON profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert_authenticated" ON profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_update_own_or_admin" ON profiles
  FOR UPDATE
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
  ));

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- Generic policy style for main entities: allow authenticated reads and admins/managers to write.
CREATE POLICY "universities_select_authenticated" ON universities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "universities_manage_admin_manager" ON universities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "venues_select_authenticated" ON venues
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "venues_manage_admin_manager" ON venues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "clients_select_authenticated" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "clients_manage_admin_manager" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "groups_select_authenticated" ON groups
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "groups_manage_admin_manager" ON groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "group_members_select_authenticated" ON group_members
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "group_members_manage_admin_manager" ON group_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "rrpp_profiles_select_authenticated" ON rrpp_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "rrpp_profiles_manage_admin_manager" ON rrpp_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "events_select_authenticated" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "events_manage_admin_manager" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "reservations_select_authenticated" ON reservations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "reservations_manage_admin_manager" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "attendance_select_authenticated" ON attendance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "attendance_manage_admin_manager" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "client_activity_select_authenticated" ON client_activity
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "client_activity_manage_admin_manager" ON client_activity
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "commissions_select_authenticated" ON commissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "commissions_manage_admin_manager" ON commissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

-- ============================================================
-- Optional: trigger to auto-create profiles from auth.users
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role, avatar_url, active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    'viewer',
    NEW.raw_user_meta_data ->> 'avatar_url',
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
