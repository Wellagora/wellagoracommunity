-- CLEAN SLATE: Delete all existing expert_contents
DELETE FROM expert_contents;

-- Insert 8 Hungarian-first programs with proper sponsorship
-- Note: access_level uses 'premium' for sponsored content (constraint limitation)
INSERT INTO expert_contents (
  id, title, title_en, title_de, description, description_en, description_de,
  image_url, thumbnail_url, price_huf, access_type, access_level, category,
  is_published, is_featured, is_sponsored, sponsor_name, created_at
) VALUES
-- SPONSORED PROGRAMS (5)
(
  gen_random_uuid(),
  'Kovászkenyér mesterkurzus',
  'Sourdough Bread Masterclass',
  'Sauerteigbrot Meisterkurs',
  'A tökéletes kovászkenyér titkai. Megtanítom, hogyan ápold a kovászodat és süsd meg a tökéletes kenyeret.',
  'Secrets of perfect sourdough bread. Learn how to nurture your starter and bake the perfect loaf.',
  'Geheimnisse des perfekten Sauerteigbrots. Lerne, wie du deinen Starter pflegst und das perfekte Brot bäckst.',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
  15000, 'paid', 'premium', 'gastronomy',
  true, true, true, 'Helyi Értékek Alapítvány',
  NOW()
),
(
  gen_random_uuid(),
  'Városi méhészet kezdőknek',
  'Urban Beekeeping for Beginners',
  'Stadtimkerei für Anfänger',
  'Fedezd fel a méhészkedés világát! Tanuld meg, hogyan tarts méheket a városban és hogyan gondozd őket.',
  'Discover the world of beekeeping! Learn how to keep bees in the city and care for them.',
  'Entdecke die Welt der Imkerei! Lerne, wie man Bienen in der Stadt hält und pflegt.',
  'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop',
  12000, 'paid', 'premium', 'sustainability',
  true, true, true, 'Zöld Jövő Egyesület',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  'Jóga a természetben',
  'Yoga in Nature',
  'Yoga in der Natur',
  'Lélegezz fel a szabadban! Reggeli jóga a Káli-medence gyönyörű tájain, ahol test és lélek harmóniába kerül.',
  'Breathe in the open air! Morning yoga in the beautiful landscapes of the Káli Basin.',
  'Atme in der freien Natur! Morgenyoga in den wunderschönen Landschaften des Káli-Beckens.',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
  8000, 'paid', 'premium', 'wellness',
  true, true, true, 'Wellness Alapítvány',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  'Gyógynövénygyűjtés túra',
  'Medicinal Herb Foraging Tour',
  'Heilkräuter-Sammelwanderung',
  'Ismerd meg a helyi gyógynövényeket! Együtt járjuk be a régió leggazdagabb gyógynövény-lelőhelyeit.',
  'Discover local medicinal herbs! Together we explore the richest herb locations in the region.',
  'Entdecke heimische Heilkräuter! Gemeinsam erkunden wir die reichsten Kräuterstandorte der Region.',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop',
  10000, 'paid', 'premium', 'wellness',
  true, false, true, 'Természet Barátai',
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  'Borkóstoló és pincetúra',
  'Wine Tasting and Cellar Tour',
  'Weinprobe und Kellerführung',
  'Ismerd meg a régió borait! Családi pincészetünkben megkóstolhatod legjobb borainkat.',
  'Discover the wines of our region! In our family winery, you can taste our best wines.',
  'Entdecke die Weine unserer Region! In unserem Familienweingut kannst du unsere besten Weine probieren.',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
  18000, 'paid', 'premium', 'gastronomy',
  true, false, true, 'Balatonfelvidéki Borút',
  NOW() - INTERVAL '4 days'
),
-- NON-SPONSORED PROGRAMS (3)
(
  gen_random_uuid(),
  'Kosárfonás kezdőknek',
  'Basket Weaving for Beginners',
  'Korbflechten für Einsteiger',
  'Fonds meg az első kosaradat! Lépésről lépésre megtanítom a fonás alapjait természetes fűzfavesszőből.',
  'Weave your first basket! I will teach you the basics of weaving step by step with natural willow.',
  'Flechte deinen ersten Korb! Ich zeige dir Schritt für Schritt die Grundlagen des Flechtens.',
  'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1595855759920-86582396756a?w=400&h=300&fit=crop',
  9000, 'paid', 'one_time_purchase', 'workshop',
  true, false, false, NULL,
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  'Agyagozás regionális anyaggal',
  'Pottery with Regional Clay',
  'Töpfern mit regionalem Ton',
  'Készíts egyedi kerámiatárgyakat helyi agyagból! Megtanulod az alapvető technikákat és a mázazást.',
  'Create unique ceramic pieces from local clay! Learn basic techniques and glazing.',
  'Erstelle einzigartige Keramikstücke aus lokalem Ton! Lerne grundlegende Techniken und Glasuren.',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
  11000, 'paid', 'one_time_purchase', 'workshop',
  true, false, false, NULL,
  NOW() - INTERVAL '6 days'
),
(
  gen_random_uuid(),
  'Fermentálás alapjai',
  'Fermentation Basics',
  'Fermentation Grundlagen',
  'Ismerd meg a fermentálás csodáját! Készíts savanyú káposztát, kimchit és más erjesztett finomságokat.',
  'Discover the wonder of fermentation! Make sauerkraut, kimchi, and other fermented delicacies.',
  'Entdecke das Wunder der Fermentation! Mache Sauerkraut, Kimchi und andere fermentierte Köstlichkeiten.',
  'https://images.unsplash.com/photo-1589927986089-35812418d78c?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1589927986089-35812418d78c?w=400&h=300&fit=crop',
  7500, 'paid', 'one_time_purchase', 'gastronomy',
  true, false, false, NULL,
  NOW() - INTERVAL '7 days'
);