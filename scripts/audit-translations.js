import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON files
const huPath = path.join(__dirname, '../src/locales/hu.json');
const enPath = path.join(__dirname, '../src/locales/en.json');
const dePath = path.join(__dirname, '../src/locales/de.json');

const hu = JSON.parse(fs.readFileSync(huPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

// Flatten nested object to dot notation
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], newKey));
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

const huFlat = flattenObject(hu);
const enFlat = flattenObject(en);
const deFlat = flattenObject(de);

const huKeys = Object.keys(huFlat);
const enKeys = Object.keys(enFlat);
const deKeys = Object.keys(deFlat);

// Find missing keys
const missingInEn = huKeys.filter(key => !enKeys.includes(key));
const missingInDe = huKeys.filter(key => !deKeys.includes(key));

// Find orphan keys (exist in en/de but not in hu)
const orphanInEn = enKeys.filter(key => !huKeys.includes(key));
const orphanInDe = deKeys.filter(key => !huKeys.includes(key));

console.log('=== TRANSLATION AUDIT REPORT ===\n');
console.log(`Total keys in hu.json (master): ${huKeys.length}`);
console.log(`Total keys in en.json: ${enKeys.length}`);
console.log(`Total keys in de.json: ${deKeys.length}\n`);

console.log(`Missing in en.json: ${missingInEn.length} keys (${((enKeys.length / huKeys.length) * 100).toFixed(1)}% complete)`);
console.log(`Missing in de.json: ${missingInDe.length} keys (${((deKeys.length / huKeys.length) * 100).toFixed(1)}% complete)\n`);

if (orphanInEn.length > 0) {
  console.log(`⚠️  Orphan keys in en.json (not in hu.json): ${orphanInEn.length}`);
}
if (orphanInDe.length > 0) {
  console.log(`⚠️  Orphan keys in de.json (not in hu.json): ${orphanInDe.length}\n`);
}

// Output missing keys to files for reference
if (missingInEn.length > 0) {
  const missingEnData = {};
  missingInEn.forEach(key => {
    missingEnData[key] = huFlat[key];
  });
  fs.writeFileSync(
    path.join(__dirname, 'missing-en.json'),
    JSON.stringify(missingEnData, null, 2)
  );
  console.log('\n✓ Missing EN keys written to scripts/missing-en.json');
}

if (missingInDe.length > 0) {
  const missingDeData = {};
  missingInDe.forEach(key => {
    missingDeData[key] = huFlat[key];
  });
  fs.writeFileSync(
    path.join(__dirname, 'missing-de.json'),
    JSON.stringify(missingDeData, null, 2)
  );
  console.log('✓ Missing DE keys written to scripts/missing-de.json');
}

// Show sample of missing keys
if (missingInEn.length > 0) {
  console.log('\n--- Sample missing EN keys (first 20) ---');
  missingInEn.slice(0, 20).forEach(key => {
    console.log(`  ${key}: "${huFlat[key]}"`);
  });
}

if (missingInDe.length > 0) {
  console.log('\n--- Sample missing DE keys (first 20) ---');
  missingInDe.slice(0, 20).forEach(key => {
    console.log(`  ${key}: "${huFlat[key]}"`);
  });
}

console.log('\n=== END REPORT ===');
