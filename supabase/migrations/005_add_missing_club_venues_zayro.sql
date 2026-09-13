-- ZAYRO CRM v1 — completes missing club catalog rows
-- safe idempotent common names

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Bandido', 'Valencia', '@bandido', TRUE, 'Venue Bandido'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Bandido' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Mucho', 'Valencia', '@mucho', TRUE, 'Venue Mucho'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Mucho' AND city = 'Valencia');

INSERT INTO venues (name, city, instagram, active, notes)
SELECT 'Marina Beach', 'Valencia', '@marinabeach', TRUE, 'Venue Marina Beach'
WHERE NOT EXISTS (SELECT 1 FROM venues WHERE name = 'Marina Beach' AND city = 'Valencia');