-- Fix challenge IDs to match existing challenges in the data file
UPDATE challenge_sponsorships 
SET challenge_id = 'bike-to-work-month'
WHERE challenge_id = 'bike-to-work';

UPDATE challenge_sponsorships
SET challenge_id = 'plastic-free-lifestyle'
WHERE challenge_id = 'zero-waste-challenge';