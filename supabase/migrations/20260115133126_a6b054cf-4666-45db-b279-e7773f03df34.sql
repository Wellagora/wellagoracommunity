-- Create 8 expert contents with urban themes
INSERT INTO expert_contents (creator_id, title, title_en, title_de, description, description_en, description_de, category, access_type, price_huf, is_published, is_featured, image_url, created_at)
VALUES 
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'Vezetői Mindfulness Bécsben', 'Executive Mindfulness in Vienna', 'Führungskräfte Achtsamkeit in Wien', 'Fedezd fel a mindfulness erejét a vezetői munkában. Egy napos intenzív tréning a bécsi belvárosban.', 'Discover the power of mindfulness in leadership. One-day intensive training in Vienna city center.', 'Entdecken Sie die Kraft der Achtsamkeit in der Führung.', 'wellness', 'paid', 12900, true, true, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', NOW() - INTERVAL '25 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'Digitális Detox Eisenstadtban', 'Digital Detox in Eisenstadt', 'Digitale Entgiftung in Eisenstadt', 'Szabadulj meg a digitális függőségtől! Hétvégi elvonulás a Fertő-tó partján.', 'Break free from digital addiction! Weekend retreat by Lake Neusiedl.', 'Befreien Sie sich von der digitalen Abhängigkeit!', 'wellness', 'paid', 18500, true, true, 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=600&fit=crop', NOW() - INTERVAL '22 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'Üzleti Etika Workshop Budapest', 'Business Ethics Workshop', 'Geschäftsethik Workshop', 'Etikus üzleti döntéshozatal a 21. században.', 'Ethical business decision-making in the 21st century.', 'Ethische Geschäftsentscheidungen im 21. Jahrhundert.', 'business', 'paid', 9800, true, false, 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop', NOW() - INTERVAL '18 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'Stresszkezelés Vezetőknek', 'Stress Management for Executives', 'Stressmanagement für Führungskräfte', 'Tanuld meg kezelni a vezetői stresszt modern technikákkal.', 'Learn to manage executive stress with modern techniques.', 'Lernen Sie, Führungsstress mit modernen Techniken zu bewältigen.', 'wellness', 'paid', 7500, true, false, 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=600&fit=crop', NOW() - INTERVAL '15 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'Fenntartható Vállalkozás Sopronban', 'Sustainable Business in Sopron', 'Nachhaltiges Geschäft in Sopron', 'Hogyan építs fenntartható és nyereséges vállalkozást?', 'How to build a sustainable and profitable business?', 'Wie baut man ein nachhaltiges und profitables Unternehmen auf?', 'business', 'paid', 11200, true, true, 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', NOW() - INTERVAL '12 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'Csapatépítés a Természetben', 'Team Building in Nature', 'Teambuilding in der Natur', 'Erősítsd a csapatod a Bécsi-erdőben!', 'Strengthen your team in the Vienna Woods!', 'Stärken Sie Ihr Team im Wienerwald!', 'wellness', 'paid', 15600, true, false, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop', NOW() - INTERVAL '8 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'Kommunikációs Készségek', 'Communication Skills', 'Kommunikationsfähigkeiten', 'Hatékony kommunikáció a munkahelyen.', 'Effective communication in the workplace.', 'Effektive Kommunikation am Arbeitsplatz.', 'business', 'paid', 21500, true, false, 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=600&fit=crop', NOW() - INTERVAL '5 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'Work-Life Balance Mesterkurzus', 'Work-Life Balance Masterclass', 'Work-Life-Balance Meisterkurs', 'Találd meg az egyensúlyt a munka és a magánélet között.', 'Find balance between work and personal life.', 'Finden Sie die Balance zwischen Arbeit und Privatleben.', 'wellness', 'paid', 8900, true, true, 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop', NOW() - INTERVAL '2 days');

-- Create 3 events
INSERT INTO events (title, description, start_date, end_date, location_name, location_address, is_public, created_by, created_at)
VALUES 
('Mindfulness Reggeli Budapest', 'Ingyenes mindfulness session a Városligetben.', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days' + INTERVAL '2 hours', 'Városliget', 'Budapest, 1146', true, 'eef2bfde-56ca-48fd-a583-1bd9666e93b3', NOW() - INTERVAL '7 days'),
('Networking Event Bécs', 'Ismerkedési est vállalkozóknak.', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '3 hours', 'Café Central', 'Vienna, 1010', true, 'eef2bfde-56ca-48fd-a583-1bd9666e93b3', NOW() - INTERVAL '14 days'),
('CSR Workshop Eisenstadt', 'Fenntarthatósági workshop cégvezetőknek.', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '4 hours', 'Success Inc. HQ', 'Eisenstadt, 7000', true, '199346df-1ef7-4b85-9f96-610356a7c5ca', NOW() - INTERVAL '10 days');

-- Create notifications with valid types: milestone, community, reminder, admin
INSERT INTO notifications (user_id, type, title, message, read, created_at)
VALUES 
('d150eb0a-5923-45b2-aa04-9f9c39e211d4', 'milestone', 'Új program elérhető!', 'Dr. Kovács István új mindfulness kurzust indít Bécsben.', false, NOW() - INTERVAL '2 days'),
('d150eb0a-5923-45b2-aa04-9f9c39e211d4', 'community', 'Üdvözlünk!', 'Köszöntünk a WellAgora közösségben!', true, NOW() - INTERVAL '28 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'milestone', 'Új szponzoráció!', 'Success Inc. szponzorálta a programodat.', true, NOW() - INTERVAL '20 days'),
('eef2bfde-56ca-48fd-a583-1bd9666e93b3', 'community', 'Új értékelés!', '5 csillagos értékelést kaptál!', false, NOW() - INTERVAL '5 days'),
('199346df-1ef7-4b85-9f96-610356a7c5ca', 'milestone', 'Kredit jóváírva', '35,000 Ft kredit jóváírva.', true, NOW() - INTERVAL '30 days'),
('199346df-1ef7-4b85-9f96-610356a7c5ca', 'reminder', 'Hatásjelentés', '12 résztvevő fejezte be a programokat.', false, NOW() - INTERVAL '5 days'),
('3ddf8449-98ac-4134-8441-287f1effabc1', 'admin', 'Új felhasználók', '3 új regisztráció az elmúlt héten.', true, NOW() - INTERVAL '7 days');

-- Create credit transactions with valid types: purchase, spend, refund
INSERT INTO credit_transactions (sponsor_user_id, credits, transaction_type, description, created_at)
VALUES 
('199346df-1ef7-4b85-9f96-610356a7c5ca', 50000, 'purchase', 'Initial credit package', NOW() - INTERVAL '30 days'),
('199346df-1ef7-4b85-9f96-610356a7c5ca', -5000, 'spend', 'Sponsored: Mindfulness', NOW() - INTERVAL '20 days'),
('199346df-1ef7-4b85-9f96-610356a7c5ca', -4000, 'spend', 'Sponsored: Detox', NOW() - INTERVAL '18 days'),
('199346df-1ef7-4b85-9f96-610356a7c5ca', -3000, 'spend', 'Sponsored: Business', NOW() - INTERVAL '10 days'),
('199346df-1ef7-4b85-9f96-610356a7c5ca', -3000, 'spend', 'Sponsored: Work-Life', NOW() - INTERVAL '5 days');