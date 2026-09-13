-- ZAYRO CRM v1 — Auth profile and RLS policy migration
-- Run after 001_create_core_schema.sql and 002_seed_reference_tables.sql.

-- ------------------------------------------------------------
-- 1) Helper views/functions for role ownership checks
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  );
$$;

-- ------------------------------------------------------------
-- 2) Auth profile trigger
-- ------------------------------------------------------------

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
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------
-- 3) RLS policies for profiles
-- ------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated" ON profiles
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "profiles_insert_authenticated" ON profiles;
CREATE POLICY "profiles_insert_authenticated" ON profiles
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON profiles;
CREATE POLICY "profiles_update_own_or_admin" ON profiles
FOR UPDATE
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON profiles;
CREATE POLICY "profiles_delete_admin" ON profiles
FOR DELETE
USING (public.is_admin());

-- ------------------------------------------------------------
-- 4) RRPP profiles policy
-- ------------------------------------------------------------

ALTER TABLE rrpp_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rrpp_profiles_select_authenticated" ON rrpp_profiles;
CREATE POLICY "rrpp_profiles_select_authenticated" ON rrpp_profiles
FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "rrpp_profiles_manage_admin_manager" ON rrpp_profiles;
CREATE POLICY "rrpp_profiles_manage_admin_manager" ON rrpp_profiles
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- ------------------------------------------------------------
-- 5) Stronger RLS template for all core business tables
-- ------------------------------------------------------------

-- Universities
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "universities_select_authenticated" ON universities;
CREATE POLICY "universities_select_authenticated" ON universities
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "universities_manage_admin_manager" ON universities;
CREATE POLICY "universities_manage_admin_manager" ON universities
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Venues
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "venues_select_authenticated" ON venues;
CREATE POLICY "venues_select_authenticated" ON venues
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "venues_manage_admin_manager" ON venues;
CREATE POLICY "venues_manage_admin_manager" ON venues
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_select_authenticated" ON clients;
CREATE POLICY "clients_select_authenticated" ON clients
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "clients_manage_admin_manager" ON clients;
CREATE POLICY "clients_manage_admin_manager" ON clients
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Segments
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "segments_select_authenticated" ON segments;
CREATE POLICY "segments_select_authenticated" ON segments
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "segments_manage_admin_manager" ON segments;
CREATE POLICY "segments_manage_admin_manager" ON segments
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Client segments
ALTER TABLE client_segments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_segments_select_authenticated" ON client_segments;
CREATE POLICY "client_segments_select_authenticated" ON client_segments
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "client_segments_manage_admin_manager" ON client_segments;
CREATE POLICY "client_segments_manage_admin_manager" ON client_segments
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Groups
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "groups_select_authenticated" ON groups;
CREATE POLICY "groups_select_authenticated" ON groups
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "groups_manage_admin_manager" ON groups;
CREATE POLICY "groups_manage_admin_manager" ON groups
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Group members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "group_members_select_authenticated" ON group_members;
CREATE POLICY "group_members_select_authenticated" ON group_members
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "group_members_manage_admin_manager" ON group_members;
CREATE POLICY "group_members_manage_admin_manager" ON group_members
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select_authenticated" ON events;
CREATE POLICY "events_select_authenticated" ON events
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "events_manage_admin_manager" ON events;
CREATE POLICY "events_manage_admin_manager" ON events
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reservations_select_authenticated" ON reservations;
CREATE POLICY "reservations_select_authenticated" ON reservations
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "reservations_manage_admin_manager" ON reservations;
CREATE POLICY "reservations_manage_admin_manager" ON reservations
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_select_authenticated" ON attendance;
CREATE POLICY "attendance_select_authenticated" ON attendance
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "attendance_manage_admin_manager" ON attendance;
CREATE POLICY "attendance_manage_admin_manager" ON attendance
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Activity
ALTER TABLE client_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "client_activity_select_authenticated" ON client_activity;
CREATE POLICY "client_activity_select_authenticated" ON client_activity
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "client_activity_manage_admin_manager" ON client_activity;
CREATE POLICY "client_activity_manage_admin_manager" ON client_activity
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- Commissions
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "commissions_select_authenticated" ON commissions;
CREATE POLICY "commissions_select_authenticated" ON commissions
FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "commissions_manage_admin_manager" ON commissions;
CREATE POLICY "commissions_manage_admin_manager" ON commissions
FOR ALL
USING (public.is_manager_or_admin())
WITH CHECK (public.is_manager_or_admin());

-- ------------------------------------------------------------
-- 6) Helpful app policy: RRPP can see only own records by relationship
-- ------------------------------------------------------------

-- RRPP may see their own RRPP profile row.
CREATE POLICY "rrpp_profiles_own_profile_select" ON rrpp_profiles
FOR SELECT
USING (profile_id = auth.uid());

-- RRPP may see clients attached through reservations/activities that belong to their profile in future.
-- This is intentionally permissive in V1 and should be replaced by deterministic ownership.
CREATE POLICY "rrpp_can_see_own_client_records" ON clients
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role = 'rrpp'
  )
);
