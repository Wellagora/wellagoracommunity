-- Update sponsor names from foundations to retail partners
UPDATE expert_contents 
SET sponsor_name = 'Praktiker', 
    sponsor_logo_url = 'https://logo.clearbit.com/praktiker.hu'
WHERE sponsor_name IN ('Helyi Értékek Alapítvány', 'Káli Panzió');

UPDATE expert_contents 
SET sponsor_name = 'DM', 
    sponsor_logo_url = 'https://logo.clearbit.com/dm.de'
WHERE sponsor_name = 'Zöld Jövő Egyesület';

UPDATE expert_contents 
SET sponsor_name = 'Rossmann', 
    sponsor_logo_url = 'https://logo.clearbit.com/rossmann.de'
WHERE sponsor_name = 'Wellness Alapítvány';

UPDATE expert_contents 
SET sponsor_name = 'OBI', 
    sponsor_logo_url = 'https://logo.clearbit.com/obi.de'
WHERE sponsor_name = 'Természet Barátai';

UPDATE expert_contents 
SET sponsor_name = 'IKEA', 
    sponsor_logo_url = 'https://logo.clearbit.com/ikea.com'
WHERE sponsor_name = 'Balatonfelvidéki Borút';