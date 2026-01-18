-- Add English and German translations to Kovászos videókurzus for cross-language test
UPDATE expert_contents 
SET 
  title_en = 'Sourdough Video Course',
  title_de = 'Sauerteig-Videokurs',
  description_en = 'Learn how to make sourdough bread step by step, at your own pace.',
  description_de = 'Lernen Sie Schritt für Schritt, wie man Sauerteigbrot backt, in Ihrem eigenen Tempo.'
WHERE title = 'Kovászos videókurzus';