-- ZAYRO CRM v1 — Esquema Supabase / PostgreSQL
-- Ejecutar en el SQL Editor de Supabase

-- Enums
CREATE TYPE client_type AS ENUM ('nuevo', 'recurrente', 'vip', 'core_member', 'connector', 'top_connector');
CREATE TYPE preferred_day AS ENUM ('viernes', 'sabado', 'ambos');
CREATE TYPE reservation_status AS ENUM ('pendiente', 'confirmada', 'asistio', 'no_show', 'cancelada');
CREATE TYPE score_action AS ENUM (
  'primera_salida', 'vuelve', 'trae_grupo', 'reserva_vip',
  'repite_vip', 'trae_otro_grupo', 'alta_frecuencia'
);

-- RRPP
CREATE TABLE rrpp_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 10.00,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grupos
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  usual_day preferred_day DEFAULT 'viernes',
  avg_size INTEGER DEFAULT 6,
  usual_club TEXT,
  leader_client_id UUID,
  last_outing_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  type client_type DEFAULT 'nuevo',
  university TEXT,
  origin TEXT DEFAULT 'España',
  preferred_day preferred_day DEFAULT 'viernes',
  usual_club TEXT,
  usual_group_size INTEGER DEFAULT 1,
  is_vip BOOLEAN DEFAULT false,
  zayro_score INTEGER DEFAULT 0,
  notes TEXT,
  rrpp_id UUID REFERENCES rrpp_members(id) ON DELETE SET NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  outings_count INTEGER DEFAULT 0,
  vip_count INTEGER DEFAULT 0,
  reservations_count INTEGER DEFAULT 0,
  estimated_spend DECIMAL(10,2) DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE groups ADD CONSTRAINT fk_leader FOREIGN KEY (leader_client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Miembros de grupo
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, client_id)
);

-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  club TEXT NOT NULL,
  event_date DATE NOT NULL,
  day_of_week preferred_day NOT NULL,
  rrpp_id UUID REFERENCES rrpp_members(id) ON DELETE SET NULL,
  entries_count INTEGER DEFAULT 0,
  vip_count INTEGER DEFAULT 0,
  reservations_count INTEGER DEFAULT 0,
  revenue_estimate DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reservas
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  people_count INTEGER DEFAULT 1,
  is_vip BOOLEAN DEFAULT false,
  status reservation_status DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Salidas (visitas)
CREATE TABLE outings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  is_vip BOOLEAN DEFAULT false,
  group_size INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Historial ZAYRO Score
CREATE TABLE score_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  action score_action NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_score ON clients(zayro_score DESC);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_reservations_status ON reservations(status);

-- RLS (habilitar cuando configures Auth)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrpp_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE outings ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Políticas abiertas para MVP (reemplazar con auth.uid() en producción)
CREATE POLICY "Allow all for authenticated" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON events FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON reservations FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON rrpp_members FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON outings FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON score_events FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON group_members FOR ALL USING (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
