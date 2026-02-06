import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read translation mappings
const translationsPath = path.join(__dirname, 'translations-complete.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf8'));

// Read locale files
const huPath = path.join(__dirname, '../src/locales/hu.json');
const enPath = path.join(__dirname, '../src/locales/en.json');
const dePath = path.join(__dirname, '../src/locales/de.json');

const hu = JSON.parse(fs.readFileSync(huPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Helper to get nested value
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper to set nested value
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Apply translations
let enAdded = 0;
let deAdded = 0;

for (const [key, trans] of Object.entries(translations)) {
  // Add to EN if missing
  if (!getNestedValue(en, key)) {
    setNestedValue(en, key, trans.en);
    enAdded++;
  }
  
  // Add to DE if missing
  if (!getNestedValue(de, key)) {
    setNestedValue(de, key, trans.de);
    deAdded++;
  }
}

// Write updated files
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(dePath, JSON.stringify(de, null, 2) + '\n');

console.log('✅ Translations applied!\n');
console.log(`EN: ${enAdded} translations added`);
console.log(`DE: ${deAdded} translations added`);
console.log('\nFiles updated:');
console.log('  - src/locales/en.json');
console.log('  - src/locales/de.json');
