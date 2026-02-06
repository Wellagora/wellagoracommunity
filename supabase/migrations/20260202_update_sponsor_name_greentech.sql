-- Update sponsor test data from "Success Inc." to "GreenTech Kft."
-- This aligns with the sponsor name used in voucher test data

-- Update sponsors table
UPDATE sponsors 
SET 
  name = 'GreenTech Kft.',
  slug = 'greentech-kft',
  description = 'Fenntartható megoldások és zöld technológiák'
WHERE id = '0be71725-70ac-4bd6-81b0-9fe106ed1573';

-- Update profiles table organization names
UPDATE profiles 
SET 
  organization_name = 'GreenTech Kft.',
  organization_name_de = 'GreenTech GmbH',
  organization_name_en = 'GreenTech Ltd.'
WHERE id = '0be71725-70ac-4bd6-81b0-9fe106ed1573'
  OR id = '199346df-1ef7-4b85-9f96-610356a7c5ca';
