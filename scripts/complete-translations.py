#!/usr/bin/env python3
import json
import os

# Terminology mapping
TERMINOLOGY = {
    'Tag': {'en': 'Member', 'de': 'Mitglied'},
    'Tagok': {'en': 'Members', 'de': 'Mitglieder'},
    'Szakértő': {'en': 'Expert', 'de': 'Expert:In'},
    'Szakértők': {'en': 'Experts', 'de': 'Expert:Innen'},
    'Szponzor': {'en': 'Sponsor', 'de': 'Sponsor'},
    'Támogató': {'en': 'Sponsor', 'de': 'Sponsor'},
    'Program': {'en': 'Program', 'de': 'Programm'},
    'Programok': {'en': 'Programs', 'de': 'Programme'},
    'Közösség': {'en': 'Community', 'de': 'Gemeinschaft'},
    'Piactér': {'en': 'Marketplace', 'de': 'Marktplatz'},
    'Esemény': {'en': 'Event', 'de': 'Veranstaltung'},
    'Események': {'en': 'Events', 'de': 'Veranstaltungen'},
    'Voucher': {'en': 'Voucher', 'de': 'Gutschein'},
    'Kupon': {'en': 'Voucher', 'de': 'Gutschein'},
    'Műhelytitok': {'en': 'Program', 'de': 'Programm'},
    'Kurzus': {'en': 'Program', 'de': 'Programm'},
    'Kurzusok': {'en': 'Programs', 'de': 'Programme'},
}

# Common phrase translations
PHRASES = {
    'en': {
        'Nincs': 'No',
        'Még nincs': 'No ... yet',
        'Összes': 'All',
        'Új': 'New',
        'Mentés': 'Save',
        'Mégse': 'Cancel',
        'Törlés': 'Delete',
        'Szerkesztés': 'Edit',
        'Vissza': 'Back',
        'Tovább': 'Next',
        'Befejezve': 'Completed',
        'Folyamatban': 'In Progress',
        'Aktív': 'Active',
        'Ingyenes': 'Free',
        'Fizetős': 'Paid',
        'Hiba': 'Error',
        'Sikeres': 'Successful',
        'Betöltés': 'Loading',
        'Keresés': 'Search',
        'Szűrés': 'Filter',
        'Részletek': 'Details',
        'Leírás': 'Description',
        'Cím': 'Title',
        'Kategória': 'Category',
        'Státusz': 'Status',
        'Dátum': 'Date',
        'Ár': 'Price',
        'Összeg': 'Amount',
        'Felhasználó': 'User',
        'Felhasználók': 'Users',
        'Beállítások': 'Settings',
        'Profil': 'Profile',
        'Értesítések': 'Notifications',
        'Üzenet': 'Message',
        'Küldés': 'Send',
        'Frissítés': 'Refresh',
        'Letöltés': 'Download',
        'Feltöltés': 'Upload',
        'Megnyitás': 'Open',
        'Bezárás': 'Close',
        'Megerősítés': 'Confirm',
        'Elutasítás': 'Reject',
        'Jóváhagyás': 'Approve',
        'Archivált': 'Archived',
        'Piszkozat': 'Draft',
        'Közzétéve': 'Published',
        'Jelentkezés': 'Join',
        'Lemondás': 'Cancel',
        'Beváltás': 'Redeem',
        'Foglalás': 'Booking',
        'Résztvevő': 'Participant',
        'Résztvevők': 'Participants',
        'Támogatott': 'Sponsored',
        'Megvásárolt': 'Purchased',
    },
    'de': {
        'Nincs': 'Keine',
        'Még nincs': 'Noch keine',
        'Összes': 'Alle',
        'Új': 'Neu',
        'Mentés': 'Speichern',
        'Mégse': 'Abbrechen',
        'Törlés': 'Löschen',
        'Szerkesztés': 'Bearbeiten',
        'Vissza': 'Zurück',
        'Tovább': 'Weiter',
        'Befejezve': 'Abgeschlossen',
        'Folyamatban': 'In Bearbeitung',
        'Aktív': 'Aktiv',
        'Ingyenes': 'Kostenlos',
        'Fizetős': 'Kostenpflichtig',
        'Hiba': 'Fehler',
        'Sikeres': 'Erfolgreich',
        'Betöltés': 'Laden',
        'Keresés': 'Suchen',
        'Szűrés': 'Filtern',
        'Részletek': 'Details',
        'Leírás': 'Beschreibung',
        'Cím': 'Titel',
        'Kategória': 'Kategorie',
        'Státusz': 'Status',
        'Dátum': 'Datum',
        'Ár': 'Preis',
        'Összeg': 'Betrag',
        'Felhasználó': 'Benutzer',
        'Felhasználók': 'Benutzer',
        'Beállítások': 'Einstellungen',
        'Profil': 'Profil',
        'Értesítések': 'Benachrichtigungen',
        'Üzenet': 'Nachricht',
        'Küldés': 'Senden',
        'Frissítés': 'Aktualisieren',
        'Letöltés': 'Herunterladen',
        'Feltöltés': 'Hochladen',
        'Megnyitás': 'Öffnen',
        'Bezárás': 'Schließen',
        'Megerősítés': 'Bestätigen',
        'Elutasítás': 'Ablehnen',
        'Jóváhagyás': 'Genehmigen',
        'Archivált': 'Archiviert',
        'Piszkozat': 'Entwurf',
        'Közzétéve': 'Veröffentlicht',
        'Jelentkezés': 'Anmelden',
        'Lemondás': 'Stornieren',
        'Beváltás': 'Einlösen',
        'Foglalás': 'Buchung',
        'Résztvevő': 'Teilnehmer',
        'Résztvevők': 'Teilnehmer',
        'Támogatott': 'Gesponsert',
        'Megvásárolt': 'Gekauft',
    }
}

def translate_text(hu_text, target_lang):
    """Simple translation using terminology and phrase mappings"""
    if not hu_text or not isinstance(hu_text, str):
        return hu_text
    
    translated = hu_text
    
    # Apply terminology replacements
    for hu_term, translations in TERMINOLOGY.items():
        if hu_term in translated:
            translated = translated.replace(hu_term, translations[target_lang])
    
    # Apply phrase replacements
    for hu_phrase, target_phrase in PHRASES[target_lang].items():
        if hu_phrase in translated:
            translated = translated.replace(hu_phrase, target_phrase)
    
    # If no translation found, mark it
    if translated == hu_text and len(hu_text) > 3:
        return f"[TODO: {hu_text}]"
    
    return translated

def flatten_dict(d, parent_key='', sep='.'):
    """Flatten nested dictionary"""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, v))
    return dict(items)

def unflatten_dict(d, sep='.'):
    """Unflatten dictionary"""
    result = {}
    for key, value in d.items():
        parts = key.split(sep)
        target = result
        for part in parts[:-1]:
            if part not in target:
                target[part] = {}
            elif not isinstance(target[part], dict):
                # If there's a conflict (e.g., "admin" is both a string and has nested keys),
                # convert to dict and preserve the value under a special key
                old_value = target[part]
                target[part] = {'_value': old_value}
            target = target[part]
        target[parts[-1]] = value
    return result

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    locales_dir = os.path.join(script_dir, '..', 'src', 'locales')
    
    # Load files
    with open(os.path.join(locales_dir, 'hu.json'), 'r', encoding='utf-8') as f:
        hu = json.load(f)
    with open(os.path.join(locales_dir, 'en.json'), 'r', encoding='utf-8') as f:
        en = json.load(f)
    with open(os.path.join(locales_dir, 'de.json'), 'r', encoding='utf-8') as f:
        de = json.load(f)
    
    # Flatten
    hu_flat = flatten_dict(hu)
    en_flat = flatten_dict(en)
    de_flat = flatten_dict(de)
    
    # Find missing keys
    missing_en = [k for k in hu_flat.keys() if k not in en_flat]
    missing_de = [k for k in hu_flat.keys() if k not in de_flat]
    
    print(f"Found {len(missing_en)} missing EN keys")
    print(f"Found {len(missing_de)} missing DE keys")
    
    # Add missing translations
    en_added = 0
    de_added = 0
    
    for key in missing_en:
        en_flat[key] = translate_text(hu_flat[key], 'en')
        en_added += 1
    
    for key in missing_de:
        de_flat[key] = translate_text(hu_flat[key], 'de')
        de_added += 1
    
    # Unflatten and save
    en_complete = unflatten_dict(en_flat)
    de_complete = unflatten_dict(de_flat)
    
    with open(os.path.join(locales_dir, 'en.json'), 'w', encoding='utf-8') as f:
        json.dump(en_complete, f, ensure_ascii=False, indent=2)
        f.write('\n')
    
    with open(os.path.join(locales_dir, 'de.json'), 'w', encoding='utf-8') as f:
        json.dump(de_complete, f, ensure_ascii=False, indent=2)
        f.write('\n')
    
    print(f"\n✅ Translation complete!")
    print(f"EN: {en_added} translations added")
    print(f"DE: {de_added} translations added")
    print(f"\nFiles updated:")
    print(f"  - src/locales/en.json")
    print(f"  - src/locales/de.json")
    
    # Count TODO markers
    en_todos = sum(1 for v in en_flat.values() if isinstance(v, str) and v.startswith('[TODO:'))
    de_todos = sum(1 for v in de_flat.values() if isinstance(v, str) and v.startswith('[TODO:'))
    
    if en_todos > 0 or de_todos > 0:
        print(f"\n⚠️  Manual review needed:")
        print(f"EN: {en_todos} items marked [TODO:]")
        print(f"DE: {de_todos} items marked [TODO:]")

if __name__ == '__main__':
    main()
