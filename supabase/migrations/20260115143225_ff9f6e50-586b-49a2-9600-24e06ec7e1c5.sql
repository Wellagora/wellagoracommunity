-- =============================================
-- INSERT 8 REGIONAL PROGRAMS
-- =============================================

-- Program 1: Die Kunst des Sauerteig-Backens (Budapest) - by Márton Kovács
INSERT INTO public.expert_contents (
  id, creator_id, title, title_de, title_en, 
  description, description_de, description_en,
  category, access_type, price_huf, is_published, is_featured,
  region_id, image_url
) VALUES (
  gen_random_uuid(),
  'eef2bfde-56ca-48fd-a583-1bd9666e93b3',
  'Die Kunst des Sauerteig-Backens',
  'Die Kunst des Sauerteig-Backens',
  'The Art of Sourdough Baking',
  'Lernen Sie die Geheimnisse des perfekten Sauerteigbrotes. Von der Starter-Pflege bis zum knusprigen Ergebnis.',
  'Lernen Sie die Geheimnisse des perfekten Sauerteigbrotes. Von der Starter-Pflege bis zum knusprigen Ergebnis.',
  'Learn the secrets of perfect sourdough bread. From starter care to crusty results.',
  'Lokale Gastronomie',
  'paid',
  12900,
  true,
  true,
  'budapest',
  '/src/assets/program-sourdough.jpg'
);

-- Program 2: Urban Gardening auf dem Balkon (Vienna) - by Hanna Weber
INSERT INTO public.expert_contents (
  id, creator_id, title, title_de, title_en, 
  description, description_de, description_en,
  category, access_type, price_huf, is_published, is_featured,
  region_id, image_url
) VALUES (
  gen_random_uuid(),
  'd150eb0a-5923-45b2-aa04-9f9c39e211d4',
  'Urban Gardening auf dem Balkon',
  'Urban Gardening auf dem Balkon',
  'Urban Gardening on Your Balcony',
  'Verwandeln Sie Ihren Balkon in eine grüne Oase. Praktische Tipps für den Anbau von Kräutern und Gemüse.',
  'Verwandeln Sie Ihren Balkon in eine grüne Oase. Praktische Tipps für den Anbau von Kräutern und Gemüse.',
  'Transform your balcony into a green oasis. Practical tips for growing herbs and vegetables.',
  'Nachhaltiges Leben',
  'paid',
  9900,
  true,
  true,
  'vienna',
  '/src/assets/program-urban-garden.jpg'
);

-- Program 3: Wildkräuter-Wanderung im Burgenland (Eisenstadt) - by Elena Fischer
INSERT INTO public.expert_contents (
  id, creator_id, title, title_de, title_en, 
  description, description_de, description_en,
  category, access_type, price_huf, is_published, is_featured,
  region_id, image_url
) VALUES (
  gen_random_uuid(),
  '199346df-1ef7-4b85-9f96-610356a7c5ca',
  'Wildkräuter-Wanderung im Burgenland',
  'Wildkräuter-Wanderung im Burgenland',
  'Wild Herb Walk in Burgenland',
  'Entdecken Sie die heimischen Heilpflanzen bei einer geführten Wanderung durch die Natur des Burgenlandes.',
  'Entdecken Sie die heimischen Heilpflanzen bei einer geführten Wanderung durch die Natur des Burgenlandes.',
  'Discover local medicinal plants during a guided walk through Burgenland nature.',
  'Wohlbefinden',
  'paid',
  14900,
  true,
  true,
  'eisenstadt',
  '/src/assets/program-herbs.jpg'
);

-- Program 4: Töpfern mit regionalem Ton (Sopron) - by Nagy Zoltán
INSERT INTO public.expert_contents (
  id, creator_id, title, title_de, title_en, 
  description, description_de, description_en,
  category, access_type, price_huf, is_published, is_featured,
  region_id, image_url
) VALUES (
  gen_random_uuid(),
  '3ddf8449-98ac-4134-8441-287f1effabc1',
  'Töpfern mit regionalem Ton',
  'Töpfern mit regionalem Ton',
  'Pottery with Regional Clay',
  'Gestalten Sie mit Ihren Händen. Traditionelle Töpfertechniken mit lokal gewonnenem Ton aus der Region Sopron.',
  'Gestalten Sie mit Ihren Händen. Traditionelle Töpfertechniken mit lokal gewonnenem Ton aus der Region Sopron.',
  'Create with your hands. Traditional pottery techniques using locally sourced clay from the Sopron region.',
  'Handwerk',
  'paid',
  11900,
  true,
  true,
  'sopron',
  '/src/assets/program-pottery.jpg'
);

-- Program 5: Achtsamkeit in der Natur (Vienna) - by Hanna Weber
INSERT INTO public.expert_contents (
  id, creator_id, title, title_de, title_en, 
  description, description_de, description_en,
  category, access_type, price_huf, is_published, is_featured,
  region_id, image_url
) VALUES (
  gen_random_uuid(),
  'd150eb0a-5923-45b2-aa04-9f9c39e211d4',
  'Achtsamkeit in der Natur',
  'Achtsamkeit in der Natur',
  'Mindfulness in Nature',
  'Finden Sie innere Ruhe durch Verbindung mit der Natur. Meditationstechniken im Grünen.',
  'Finden Sie innere Ruhe durch Verbindung mit der Natur. Meditationstechniken im Grünen.',
  'Find inner peace through connection with nature. Meditation techniques in the green.',
  'Wohlbefinden',
  'paid',
  7900,
  true,
  false,
  'vienna',
  '/src/assets/program-mindfulness.jpg'
);

-- Program 6: Fermentation für Anfänger (Budapest) - by Márton Kovács
INSERT INTO public.expert_contents (
  id, creator_id, title, title_de, title_en, 
  description, description_de, description_en,
  category, access_type, price_huf, is_published, is_featured,
  region_id, image_url
) VALUES (
  gen_random_uuid(),
  'eef2bfde-56ca-48fd-a583-1bd9666e93b3',
  'Fermentation für Anfänger',
  'Fermentation für Anfänger',
  'Fermentation for Beginners',
  'Die Welt der fermentierten Lebensmittel entdecken. Sauerkraut, Kimchi und mehr selbst herstellen.',
  'Die Welt der fermentierten Lebensmittel entdecken. Sauerkraut, Kimchi und mehr selbst herstellen.',
  'Discover the world of fermented foods. Make your own sauerkraut, kimchi and more.',
  'Lokale Gastronomie',
  'paid',
  8900,
  true,
  false,
  'budapest',
  '/src/assets/program-fermentation.jpg'
);

-- Program 7: Natürliche Kosmetik selber machen (Eisenstadt) - by Elena Fischer
INSERT INTO public.expert_contents (
  id, creator_id, title, title_de, title_en, 
  description, description_de, description_en,
  category, access_type, price_huf, is_published, is_featured,
  region_id, image_url
) VALUES (
  gen_random_uuid(),
  '199346df-1ef7-4b85-9f96-610356a7c5ca',
  'Natürliche Kosmetik selber machen',
  'Natürliche Kosmetik selber machen',
  'DIY Natural Cosmetics',
  'Stellen Sie Ihre eigene Naturkosmetik her. Cremes, Salben und Seifen aus regionalen Zutaten.',
  'Stellen Sie Ihre eigene Naturkosmetik her. Cremes, Salben und Seifen aus regionalen Zutaten.',
  'Create your own natural cosmetics. Creams, balms and soaps from regional ingredients.',
  'Wohlbefinden',
  'paid',
  10900,
  true,
  false,
  'eisenstadt',
  '/src/assets/program-natural-cosmetics.jpg'
);

-- Program 8: Imkerei Grundlagen (Sopron) - by Nagy Zoltán
INSERT INTO public.expert_contents (
  id, creator_id, title, title_de, title_en, 
  description, description_de, description_en,
  category, access_type, price_huf, is_published, is_featured,
  region_id, image_url
) VALUES (
  gen_random_uuid(),
  '3ddf8449-98ac-4134-8441-287f1effabc1',
  'Imkerei Grundlagen',
  'Imkerei Grundlagen',
  'Beekeeping Basics',
  'Die faszinierende Welt der Bienen verstehen. Grundlagen für angehende Hobbyimker.',
  'Die faszinierende Welt der Bienen verstehen. Grundlagen für angehende Hobbyimker.',
  'Understand the fascinating world of bees. Basics for aspiring hobby beekeepers.',
  'Nachhaltiges Leben',
  'paid',
  15900,
  true,
  false,
  'sopron',
  '/src/assets/program-beekeeping.jpg'
);