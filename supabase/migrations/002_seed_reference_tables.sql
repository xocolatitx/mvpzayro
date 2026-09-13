-- ZAYRO CRM v1 — Reference seed data migration
-- Run after 001_create_core_schema.sql.

-- Seed universities
INSERT INTO universities (name, short_name, city, active)
VALUES
  ('Universidad de Valencia', 'UV', 'Valencia', TRUE),
  ('Universitat Politècnica de València', 'UPV', 'Valencia', TRUE),
  ('Universidad CEU Cardenal Herrera', 'CEU', 'Valencia', TRUE),
  ('Universidad de Alicante', 'UA', 'Alicante', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO universities (name, short_name, city, active)
VALUES
  ('Universidad Miguel Hernández', 'UMH', 'Elche', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Seed venues
INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Club A', 'Valencia', '@club_a', TRUE, 'Venue principal premium'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Club A' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Club B', 'Valencia', '@club_b', TRUE, 'Venue social y estudiantes'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Club B' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Club C', 'Valencia', '@club_c', TRUE, 'Venue con flujo universitario'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Club C' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Club D', 'Valencia', '@club_d', TRUE, 'Venue alternativo'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Club D' AND city = 'Valencia');

-- Seed default segments
INSERT INTO segments (code, label, scope, status, color)
VALUES
  ('client', 'Cliente', 'client', 'active', '#ffffff'),
  ('group_leader', 'Group Leader', 'client', 'active', '#d4af37'),
  ('connector', 'Connector', 'client', 'active', '#b8b8b8'),
  ('vip', 'VIP', 'client', 'active', '#f9f7e8'),
  ('erasmus', 'Erasmus', 'client', 'active', '#7dd3fc'),
  ('rrpp', 'RRPP', 'rrpp', 'active', '#e5e7eb'),
  ('imagen', 'Imagen', 'client', 'active', '#cbd5e1')
ON CONFLICT (code) DO NOTHING;
