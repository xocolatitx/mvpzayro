-- ZAYRO CRM v1 — catalog extension for requested venue and university labels
-- Safe idempotent update for new client form options.

INSERT INTO universities (name, short_name, city, active)
SELECT 'Europea', 'Europea', 'Valencia', TRUE
WHERE NOT EXISTS (SELECT 1 FROM universities WHERE name = 'Europea');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Bandido', 'Valencia', '@bandido', TRUE, 'Venue Bandido'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Bandido' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Mucho', 'Valencia', '@mucho', TRUE, 'Venue Mucho'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Mucho' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Marina Beach', 'Valencia', '@marinabeach', TRUE, 'Venue Marina Beach'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Marina Beach' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Committe', 'Valencia', '@committe', TRUE, 'Venue Committe'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Committe' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Indiana', 'Valencia', '@indiana', TRUE, 'Venue Indiana'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Indiana' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Akuarela', 'Valencia', '@akuarela', TRUE, 'Venue Akuarela'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Akuarela' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Mya', 'Valencia', '@mya', TRUE, 'Venue Mya'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Mya' AND city = 'Valencia');
