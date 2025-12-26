-- Insert sample events for testing
INSERT INTO events (title, description, location_name, village, start_date, end_date, max_participants, is_public, project_id)
VALUES 
  ('Közösségi kertészkedés', 'Tavaszi ültetés a közösségi kertben', 'Közösségi Kert', 'Kővágóörs', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '3 hours', 20, true, (SELECT id FROM projects LIMIT 1)),
  ('Káli történetmesélés', 'Helyi történetek és emlékek megosztása', 'Kultúrház', 'Mindszentkálla', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 30, true, (SELECT id FROM projects LIMIT 1)),
  ('Zero Waste Workshop', 'Tanuld meg a hulladékmentes életmódot', 'Faluház', 'Szentbékkálla', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '4 hours', 15, true, (SELECT id FROM projects LIMIT 1))
ON CONFLICT DO NOTHING;