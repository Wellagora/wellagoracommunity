-- Insert 3 test events for the Káli Basin project
INSERT INTO events (title, description, location_name, village, start_date, end_date, max_participants, is_public, project_id)
SELECT 'Közösségi kertészkedés', 'Tavaszi ültetés a közösségi kertben', 'Közösségi Kert', 'Kővágóörs', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '3 hours', 20, true, id FROM projects WHERE is_active = true LIMIT 1;

INSERT INTO events (title, description, location_name, village, start_date, end_date, max_participants, is_public, project_id)
SELECT 'Káli történetmesélés', 'Helyi történetek és emlékek megosztása', 'Kultúrház', 'Mindszentkálla', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '2 hours', 30, true, id FROM projects WHERE is_active = true LIMIT 1;

INSERT INTO events (title, description, location_name, village, start_date, end_date, max_participants, is_public, project_id)
SELECT 'Zero Waste Workshop', 'Tanuld meg a hulladékmentes életmódot', 'Faluház', 'Szentbékkálla', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '4 hours', 15, true, id FROM projects WHERE is_active = true LIMIT 1;