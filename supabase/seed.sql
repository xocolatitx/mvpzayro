-- Datos demo ZAYRO CRM
INSERT INTO rrpp_members (id, name, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Juan', '+34600000001');

INSERT INTO groups (id, name, usual_day, avg_size, usual_club) VALUES
  ('22222222-2222-2222-2222-222222222222', 'Los de ADE', 'viernes', 7, 'Bandido');

INSERT INTO clients (id, name, phone, type, university, preferred_day, usual_club, usual_group_size, is_vip, zayro_score, outings_count, vip_count, reservations_count, estimated_spend, group_id, rrpp_id) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Pablo García', '+34612345678', 'connector', 'UV', 'viernes', 'Bandido', 6, false, 68, 8, 2, 3, 480.00, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
  ('44444444-4444-4444-4444-444444444444', 'Carlos Ruiz', '+34623456789', 'recurrente', 'UV', 'viernes', 'Bandido', 4, false, 54, 6, 1, 2, 320.00, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111'),
  ('55555555-5555-5555-5555-555555555555', 'Marta López', '+34634567890', 'vip', 'UPV', 'sabado', 'Mucho', 5, true, 49, 5, 3, 2, 650.00, NULL, '11111111-1111-1111-1111-111111111111'),
  ('66666666-6666-6666-6666-666666666666', 'Laura Fernández', '+34645678901', 'recurrente', 'UV', 'viernes', 'Bandido', 3, false, 43, 4, 0, 1, 180.00, NULL, '11111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', 'Jorge Martín', '+34656789012', 'recurrente', 'Erasmus', 'sabado', 'Mucho', 8, false, 39, 3, 1, 1, 210.00, NULL, '11111111-1111-1111-1111-111111111111');

UPDATE groups SET leader_client_id = '33333333-3333-3333-3333-333333333333' WHERE id = '22222222-2222-2222-2222-222222222222';

INSERT INTO group_members (group_id, client_id) VALUES
  ('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
  ('22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444');

INSERT INTO events (id, name, club, event_date, day_of_week, rrpp_id, entries_count, vip_count, reservations_count, revenue_estimate) VALUES
  ('88888888-8888-8888-8888-888888888888', 'BANDIDO', 'Bandido', CURRENT_DATE, 'viernes', '11111111-1111-1111-1111-111111111111', 83, 7, 12, 4200.00),
  ('99999999-9999-9999-9999-999999999999', 'MUCHO', 'Mucho', CURRENT_DATE + 1, 'sabado', '11111111-1111-1111-1111-111111111111', 0, 0, 4, 0);

INSERT INTO reservations (client_id, event_id, people_count, is_vip, status) VALUES
  ('33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 6, false, 'confirmada'),
  ('55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 5, true, 'confirmada');
