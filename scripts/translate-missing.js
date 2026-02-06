import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Translation terminology mapping
const TERMINOLOGY = {
  'Tag': { en: 'Member', de: 'Mitglied' },
  'Szakértő': { en: 'Expert', de: 'Expert:In' },
  'Szponzor': { en: 'Sponsor', de: 'Sponsor' },
  'Támogató': { en: 'Sponsor', de: 'Sponsor' },
  'Program': { en: 'Program', de: 'Programm' },
  'Közösség': { en: 'Community', de: 'Gemeinschaft' },
  'Piactér': { en: 'Marketplace', de: 'Marktplatz' },
  'Esemény': { en: 'Event', de: 'Veranstaltung' },
  'Voucher': { en: 'Voucher', de: 'Gutschein' },
  'Kupon': { en: 'Voucher', de: 'Gutschein' },
  'Műhelytitok': { en: 'Program', de: 'Programm' }
};

// Manual translations for common phrases
const MANUAL_TRANSLATIONS = {
  en: {
    'Nincs értesítésed': 'No notifications',
    'Itt fogod látni a legújabb híreket és frissítéseket.': 'You will see the latest news and updates here.',
    'Összes olvasottnak jelölve': 'All marked as read',
    'Az összes értesítésed olvasottként lett megjelölve.': 'All your notifications have been marked as read.',
    'Kurzusaim': 'My Programs',
    'Kurzus': 'Program',
    'Befejezve': 'Completed',
    'Folyamatban': 'In Progress',
    'Elkezdetlen': 'Not Started',
    'Még nincs kurzusod': 'You don\'t have any programs yet',
    'Fedezd fel a Piacteret és jelentkezz egy programra!': 'Explore the Marketplace and join a program!',
    'Piactér megtekintése': 'Browse Marketplace',
    'Támogatott': 'Sponsored',
    'Megvásárolt': 'Purchased',
    'A Szakértőnél': 'At Expert\'s',
    'Támogatott hely igénylése': 'Claim sponsored spot',
    'Aktív foglalás': 'Active bookings',
    'Beváltott': 'Redeemed',
    'Hely beváltása': 'Redeem spot',
    'Beváltás': 'Redeem',
    'Add meg a Tag által bemutatott kódot': 'Enter the code shown by the Member',
    'Támogatott hely sikeresen beváltva! 🎉': 'Sponsored spot successfully redeemed! 🎉',
    'Hiba a beváltáskor': 'Error during redemption',
    'Foglalás nem található': 'Booking not found',
    'Ez a foglalás nem a Te tartalmadhoz tartozik': 'This booking does not belong to your content',
    'Ez a hely már be lett váltva': 'This spot has already been redeemed',
    'Legutóbbi beváltások': 'Recent redemptions',
    'Még nincs foglalás': 'No bookings yet',
    'Amikor valaki helyet foglal a tartalmaidhoz, itt láthatod': 'When someone books a spot for your content, you\'ll see it here',
    'Már foglaltál helyet': 'You already booked a spot',
    'Kupon igényelve!': 'Voucher claimed!',
    'Kupon igénylése': 'Claim voucher',
    'Jelentkezés': 'Join',
    'támogatásával': 'with support from',
    'Új Program': 'New Program',
    'Lépés': 'Step',
    'Vissza': 'Back',
    'Tovább': 'Next',
    'vagy': 'or',
    'Mentés vázlatként': 'Save as draft',
    'Közzététel most': 'Publish now',
    'Program sikeresen közzétéve! 🎉': 'Program published successfully! 🎉',
    'Hiba történt a közzététel során': 'Error occurred during publishing',
    'Vázlat mentve': 'Draft saved',
    'Mentés...': 'Saving...',
    'Cím nélkül': 'Untitled',
    'Leírás nélkül': 'No description',
    'mérföldkő': 'milestone',
    'mérföldkő hozzáadva': 'milestone added',
    'Töltsd ki a kötelező mezőket': 'Fill in the required fields',
    'Tartalom nem található': 'Content not found',
    'Hiba a betöltés során': 'Error loading',
    'Ingyenes': 'Free',
    'Mindenki számára elérhető': 'Available to everyone',
    'Fizetős': 'Paid',
    'Válassz árat': 'Choose price',
    'A te bevételed': 'Your revenue',
    'Platform díj': 'Platform fee',
    'Minimum 5 karakter': 'Minimum 5 characters',
    'Minimum 20 karakter': 'Minimum 20 characters',
    'Kép feltöltése': 'Upload image',
    'Kép feltöltve!': 'Image uploaded!',
    'Hiba a feltöltés során': 'Error uploading',
    'Új mérföldkő hozzáadása': 'Add new milestone',
    'Média (opcionális)': 'Media (optional)',
    'Kép hozzáadása': 'Add image',
    'Videó link': 'Video link',
    'Borítókép max': 'Cover image max',
    'Mérföldkő képek max': 'Milestone images max'
  },
  de: {
    'Nincs értesítésed': 'Keine Benachrichtigungen',
    'Itt fogod látni a legújabb híreket és frissítéseket.': 'Hier sehen Sie die neuesten Nachrichten und Updates.',
    'Összes olvasottnak jelölve': 'Alle als gelesen markiert',
    'Az összes értesítésed olvasottként lett megjelölve.': 'Alle Ihre Benachrichtigungen wurden als gelesen markiert.',
    'Kurzusaim': 'Meine Programme',
    'Kurzus': 'Programm',
    'Befejezve': 'Abgeschlossen',
    'Folyamatban': 'In Bearbeitung',
    'Elkezdetlen': 'Nicht begonnen',
    'Még nincs kurzusod': 'Sie haben noch keine Programme',
    'Fedezd fel a Piacteret és jelentkezz egy programra!': 'Erkunden Sie den Marktplatz und melden Sie sich für ein Programm an!',
    'Piactér megtekintése': 'Marktplatz durchsuchen',
    'Támogatott': 'Gesponsert',
    'Megvásárolt': 'Gekauft',
    'A Szakértőnél': 'Beim Expert:In',
    'Támogatott hely igénylése': 'Gesponserten Platz beanspruchen',
    'Aktív foglalás': 'Aktive Buchungen',
    'Beváltott': 'Eingelöst',
    'Hely beváltása': 'Platz einlösen',
    'Beváltás': 'Einlösen',
    'Add meg a Tag által bemutatott kódot': 'Geben Sie den vom Mitglied gezeigten Code ein',
    'Támogatott hely sikeresen beváltva! 🎉': 'Gesponserter Platz erfolgreich eingelöst! 🎉',
    'Hiba a beváltáskor': 'Fehler beim Einlösen',
    'Foglalás nem található': 'Buchung nicht gefunden',
    'Ez a foglalás nem a Te tartalmadhoz tartozik': 'Diese Buchung gehört nicht zu Ihrem Inhalt',
    'Ez a hely már be lett váltva': 'Dieser Platz wurde bereits eingelöst',
    'Legutóbbi beváltások': 'Letzte Einlösungen',
    'Még nincs foglalás': 'Noch keine Buchungen',
    'Amikor valaki helyet foglal a tartalmaidhoz, itt láthatod': 'Wenn jemand einen Platz für Ihren Inhalt bucht, sehen Sie es hier',
    'Már foglaltál helyet': 'Sie haben bereits einen Platz gebucht',
    'Kupon igényelve!': 'Gutschein beansprucht!',
    'Kupon igénylése': 'Gutschein beanspruchen',
    'Jelentkezés': 'Anmelden',
    'támogatásával': 'mit Unterstützung von',
    'Új Program': 'Neues Programm',
    'Lépés': 'Schritt',
    'Vissza': 'Zurück',
    'Tovább': 'Weiter',
    'vagy': 'oder',
    'Mentés vázlatként': 'Als Entwurf speichern',
    'Közzététel most': 'Jetzt veröffentlichen',
    'Program sikeresen közzétéve! 🎉': 'Programm erfolgreich veröffentlicht! 🎉',
    'Hiba történt a közzététel során': 'Fehler beim Veröffentlichen',
    'Vázlat mentve': 'Entwurf gespeichert',
    'Mentés...': 'Speichern...',
    'Cím nélkül': 'Ohne Titel',
    'Leírás nélkül': 'Keine Beschreibung',
    'mérföldkő': 'Meilenstein',
    'mérföldkő hozzáadva': 'Meilenstein hinzugefügt',
    'Töltsd ki a kötelező mezőket': 'Füllen Sie die Pflichtfelder aus',
    'Tartalom nem található': 'Inhalt nicht gefunden',
    'Hiba a betöltés során': 'Fehler beim Laden',
    'Ingyenes': 'Kostenlos',
    'Mindenki számára elérhető': 'Für alle verfügbar',
    'Fizetős': 'Kostenpflichtig',
    'Válassz árat': 'Preis wählen',
    'A te bevételed': 'Ihr Umsatz',
    'Platform díj': 'Plattformgebühr',
    'Minimum 5 karakter': 'Mindestens 5 Zeichen',
    'Minimum 20 karakter': 'Mindestens 20 Zeichen',
    'Kép feltöltése': 'Bild hochladen',
    'Kép feltöltve!': 'Bild hochgeladen!',
    'Hiba a feltöltés során': 'Fehler beim Hochladen',
    'Új mérföldkő hozzáadása': 'Neuen Meilenstein hinzufügen',
    'Média (opcionális)': 'Medien (optional)',
    'Kép hozzáadása': 'Bild hinzufügen',
    'Videó link': 'Video-Link',
    'Borítókép max': 'Titelbild max',
    'Mérföldkő képek max': 'Meilenstein-Bilder max'
  }
};

// Simple translation function
function translate(huText, targetLang) {
  // Check manual translations first
  if (MANUAL_TRANSLATIONS[targetLang] && MANUAL_TRANSLATIONS[targetLang][huText]) {
    return MANUAL_TRANSLATIONS[targetLang][huText];
  }
  
  // Apply terminology replacements
  let translated = huText;
  for (const [hu, translations] of Object.entries(TERMINOLOGY)) {
    const regex = new RegExp(hu, 'g');
    translated = translated.replace(regex, translations[targetLang]);
  }
  
  // If no translation found, return original with a marker
  if (translated === huText) {
    return `[TODO: ${huText}]`;
  }
  
  return translated;
}

// Unflatten dot notation back to nested object
function unflattenObject(flat) {
  const result = {};
  for (const key in flat) {
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = flat[key];
  }
  return result;
}

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

// Read files
const huPath = path.join(__dirname, '../src/locales/hu.json');
const enPath = path.join(__dirname, '../src/locales/en.json');
const dePath = path.join(__dirname, '../src/locales/de.json');

const hu = JSON.parse(fs.readFileSync(huPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const de = JSON.parse(fs.readFileSync(dePath, 'utf8'));

const huFlat = flattenObject(hu);
const enFlat = flattenObject(en);
const deFlat = flattenObject(de);

const huKeys = Object.keys(huFlat);
const enKeys = Object.keys(enFlat);
const deKeys = Object.keys(deFlat);

// Find missing keys
const missingInEn = huKeys.filter(key => !enKeys.includes(key));
const missingInDe = huKeys.filter(key => !deKeys.includes(key));

console.log('🔄 Starting translation process...\n');
console.log(`Missing in EN: ${missingInEn.length} keys`);
console.log(`Missing in DE: ${missingInDe.length} keys\n`);

// Add missing translations
let enTranslated = 0;
let enTodo = 0;
missingInEn.forEach(key => {
  const huValue = huFlat[key];
  const enValue = translate(huValue, 'en');
  enFlat[key] = enValue;
  if (enValue.startsWith('[TODO:')) {
    enTodo++;
  } else {
    enTranslated++;
  }
});

let deTranslated = 0;
let deTodo = 0;
missingInDe.forEach(key => {
  const huValue = huFlat[key];
  const deValue = translate(huValue, 'de');
  deFlat[key] = deValue;
  if (deValue.startsWith('[TODO:')) {
    deTodo++;
  } else {
    deTranslated++;
  }
});

// Convert back to nested objects
const enComplete = unflattenObject(enFlat);
const deComplete = unflattenObject(deFlat);

// Write updated files
fs.writeFileSync(enPath, JSON.stringify(enComplete, null, 2) + '\n');
fs.writeFileSync(dePath, JSON.stringify(deComplete, null, 2) + '\n');

console.log('✅ Translation complete!\n');
console.log(`EN: ${enTranslated} translated, ${enTodo} need manual review`);
console.log(`DE: ${deTranslated} translated, ${deTodo} need manual review\n`);
console.log('📝 Files updated:');
console.log('  - src/locales/en.json');
console.log('  - src/locales/de.json');
