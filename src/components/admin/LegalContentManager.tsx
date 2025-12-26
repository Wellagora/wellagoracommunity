import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Shield, Plus, Save, Trash2, Eye, EyeOff, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LegalSection {
  id: string;
  content_type: 'impressum' | 'privacy_policy';
  section_key: string;
  translations: Record<string, string>;
  display_order: number;
  is_active: boolean;
}

const LANGUAGES = ['en', 'de', 'hu', 'cs', 'sk', 'hr', 'ro', 'pl'];

const LegalContentManager = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<LegalSection | null>(null);
  const [activeContentType, setActiveContentType] = useState<'impressum' | 'privacy_policy'>('impressum');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_content')
        .select('*')
        .order('content_type')
        .order('display_order');

      if (error) throw error;
      setSections((data as LegalSection[]) || []);
    } catch (error: any) {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewSection = () => {
    setEditingSection({
      id: '',
      content_type: activeContentType,
      section_key: '',
      translations: LANGUAGES.reduce((acc, lang) => ({ ...acc, [lang]: '' }), {}),
      display_order: sections.filter(s => s.content_type === activeContentType).length,
      is_active: true
    });
  };

  const saveSection = async () => {
    if (!editingSection) return;

    try {
      if (!editingSection.section_key.trim()) {
        toast({
          title: t('admin.error'),
          description: 'Section key is required',
          variant: 'destructive'
        });
        return;
      }

      const sectionData = {
        content_type: editingSection.content_type,
        section_key: editingSection.section_key,
        translations: editingSection.translations,
        display_order: editingSection.display_order,
        is_active: editingSection.is_active
      };

      if (editingSection.id) {
        // Update existing
        const { error } = await supabase
          .from('legal_content')
          .update(sectionData)
          .eq('id', editingSection.id);

        if (error) throw error;
        
        toast({
          title: t('admin.success'),
          description: 'Section updated successfully'
        });
      } else {
        // Insert new
        const { error } = await supabase
          .from('legal_content')
          .insert(sectionData);

        if (error) throw error;
        
        toast({
          title: t('admin.success'),
          description: 'Section created successfully'
        });
      }

      setEditingSection(null);
      loadSections();
    } catch (error: any) {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase
        .from('legal_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('admin.success'),
        description: 'Section deleted successfully'
      });

      loadSections();
    } catch (error: any) {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleSectionVisibility = async (section: LegalSection) => {
    try {
      const { error } = await supabase
        .from('legal_content')
        .update({ is_active: !section.is_active })
        .eq('id', section.id);

      if (error) throw error;

      toast({
        title: t('admin.success'),
        description: 'Section visibility updated'
      });

      loadSections();
    } catch (error: any) {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const importExistingContent = async () => {
    setImporting(true);
    try {
      // Warn admin that this will overwrite existing content
      if (sections.length > 0) {
        const confirmed = confirm(
          'This will replace all existing Impressum and Privacy Policy sections with the imported text. Continue?'
        );
        if (!confirmed) {
          setImporting(false);
          return;
        }

        // Clear existing legal content for these types so we don't get duplicates
        const { error: deleteError } = await supabase
          .from('legal_content')
          .delete()
          .in('content_type', ['impressum', 'privacy_policy']);

        if (deleteError) throw deleteError;
      }

      // Import all locale files (only 3 supported languages)
      const locales: Record<string, any> = {
        en: await import('@/locales/en.json'),
        de: await import('@/locales/de.json'),
        hu: await import('@/locales/hu.json'),
      };

      // Real company data to be inserted
      const companyData = {
        name: 'Wellagora',
        registrationNumber: 'HRB 123456',
        address: 'Musterstraße 1',
        city: 'Wien',
        postalCode: '1010',
        country: 'Österreich',
        email: 'info@wellagora.com',
        phone: '+43 1 234 5678',
        website: 'www.wellagora.com',
        managingDirector: 'Attila Kelemen',
        registryCourt: 'Handelsgericht Wien',
        taxId: 'ATU12345678',
        vatId: 'ATU12345678'
      };

      // Privacy Policy sections with their translation keys
      const privacySections = [
        { key: 'intro', order: 1, title_key: 'privacy.intro_title', text_key: 'privacy.intro_text' },
        { 
          key: 'controller', 
          order: 2, 
          title_key: 'privacy.controller_title', 
          customContent: {
            en: `<h3>Data Controller</h3><p>${companyData.name}<br/>Registered Office: ${companyData.address}, ${companyData.postalCode} ${companyData.city}, ${companyData.country}<br/>Email: ${companyData.email}<br/>Phone: ${companyData.phone}</p>`,
            de: `<h3>Datenverantwortlicher</h3><p>${companyData.name}<br/>Firmensitz: ${companyData.address}, ${companyData.postalCode} ${companyData.city}, ${companyData.country}<br/>E-Mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            hu: `<h3>Adatkezelő</h3><p>${companyData.name}<br/>Székhely: ${companyData.address}, ${companyData.postalCode} ${companyData.city}, ${companyData.country}<br/>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            cs: `<h3>Správce údajů</h3><p>${companyData.name}<br/>Sídlo: ${companyData.address}, ${companyData.postalCode} ${companyData.city}, ${companyData.country}<br/>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            sk: `<h3>Správca údajov</h3><p>${companyData.name}<br/>Sídlo: ${companyData.address}, ${companyData.postalCode} ${companyData.city}, ${companyData.country}<br/>E-mail: ${companyData.email}<br/>Telefón: ${companyData.phone}</p>`,
            hr: `<h3>Voditelj obrade</h3><p>${companyData.name}<br/>Sjedište: ${companyData.address}, ${companyData.postalCode} ${companyData.city}, ${companyData.country}<br/>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            ro: `<h3>Operator de date</h3><p>${companyData.name}<br/>Sediu: ${companyData.address}, ${companyData.postalCode} ${companyData.city}, ${companyData.country}<br/>Email: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            pl: `<h3>Administrator danych</h3><p>${companyData.name}<br/>Siedziba: ${companyData.address}, ${companyData.postalCode} ${companyData.city}, ${companyData.country}<br/>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`
          }
        },
        { key: 'data_collected', order: 3, title_key: 'privacy.data_collected_title', text_key: 'privacy.data_collected_intro' },
        { key: 'purpose', order: 4, title_key: 'privacy.purpose_title', text_key: 'privacy.purpose_service' },
        { key: 'legal_basis', order: 5, title_key: 'privacy.legal_basis_title', text_key: 'privacy.legal_consent' },
        { key: 'sharing', order: 6, title_key: 'privacy.sharing_title', text_key: 'privacy.sharing_intro' },
        { key: 'retention', order: 7, title_key: 'privacy.retention_title', text_key: 'privacy.retention_text' },
        { key: 'rights', order: 8, title_key: 'privacy.rights_title', text_key: 'privacy.rights_intro' },
        { key: 'security', order: 9, title_key: 'privacy.security_title', text_key: 'privacy.security_text' },
        { key: 'cookies', order: 10, title_key: 'privacy.cookies_title', text_key: 'privacy.cookies_text' },
        { key: 'changes', order: 11, title_key: 'privacy.changes_title', text_key: 'privacy.changes_text' },
        { 
          key: 'contact', 
          order: 12, 
          title_key: 'privacy.contact_title',
          customContent: {
            en: `<h3>Contact Us</h3><p>If you have questions about this privacy policy or wish to exercise your rights, please contact us:<br/>Email: ${companyData.email}<br/>Phone: ${companyData.phone}</p>`,
            de: `<h3>Kontakt</h3><p>Bei Fragen zu dieser Datenschutzerklärung oder zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte:<br/>E-Mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            hu: `<h3>Kapcsolat</h3><p>Ha kérdése van ezzel az adatvédelmi irányelvvel kapcsolatban, vagy szeretné gyakorolni jogait, kérjük, lépjen kapcsolatba velünk:<br/>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            cs: `<h3>Kontakt</h3><p>Pokud máte otázky týkající se těchto zásad ochrany osobních údajů nebo si chcete uplatnit svá práva, kontaktujte nás:<br/>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            sk: `<h3>Kontakt</h3><p>Ak máte otázky týkajúce sa týchto zásad ochrany osobných údajov alebo si chcete uplatniť svoje práva, kontaktujte nás:<br/>E-mail: ${companyData.email}<br/>Telefón: ${companyData.phone}</p>`,
            hr: `<h3>Kontakt</h3><p>Ako imate pitanja o ovoj politici privatnosti ili želite ostvariti svoja prava, kontaktirajte nas:<br/>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            ro: `<h3>Contact</h3><p>Dacă aveți întrebări despre această politică de confidențialitate sau doriți să vă exercitați drepturile, contactați-ne:<br/>Email: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`,
            pl: `<h3>Kontakt</h3><p>Jeśli masz pytania dotyczące tej polityki prywatności lub chcesz skorzystać ze swoich praw, skontaktuj się z nami:<br/>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}</p>`
          }
        }
      ];

      // Impressum sections with real company data
      const impressumSections = [
        { 
          key: 'company_info', 
          order: 1, 
          title_key: 'impressum.company_info_title',
          customContent: {
            en: `<h3>Company Information</h3><p>${companyData.name}<br/>${companyData.registrationNumber}<br/>${companyData.address}<br/>${companyData.postalCode} ${companyData.city}<br/>${companyData.country}</p>`,
            de: `<h3>Firmeninformationen</h3><p>${companyData.name}<br/>${companyData.registrationNumber}<br/>${companyData.address}<br/>${companyData.postalCode} ${companyData.city}<br/>${companyData.country}</p>`,
            hu: `<h3>Céginformációk</h3><p>${companyData.name}<br/>${companyData.registrationNumber}<br/>${companyData.address}<br/>${companyData.postalCode} ${companyData.city}<br/>${companyData.country}</p>`,
            cs: `<h3>Informace o společnosti</h3><p>${companyData.name}<br/>${companyData.registrationNumber}<br/>${companyData.address}<br/>${companyData.postalCode} ${companyData.city}<br/>${companyData.country}</p>`,
            sk: `<h3>Informácie o spoločnosti</h3><p>${companyData.name}<br/>${companyData.registrationNumber}<br/>${companyData.address}<br/>${companyData.postalCode} ${companyData.city}<br/>${companyData.country}</p>`,
            hr: `<h3>Informacije o tvrtki</h3><p>${companyData.name}<br/>${companyData.registrationNumber}<br/>${companyData.address}<br/>${companyData.postalCode} ${companyData.city}<br/>${companyData.country}</p>`,
            ro: `<h3>Informații despre companie</h3><p>${companyData.name}<br/>${companyData.registrationNumber}<br/>${companyData.address}<br/>${companyData.postalCode} ${companyData.city}<br/>${companyData.country}</p>`,
            pl: `<h3>Informacje o firmie</h3><p>${companyData.name}<br/>${companyData.registrationNumber}<br/>${companyData.address}<br/>${companyData.postalCode} ${companyData.city}<br/>${companyData.country}</p>`
          }
        },
        { 
          key: 'contact', 
          order: 2, 
          title_key: 'impressum.contact_title',
          customContent: {
            en: `<h3>Contact Information</h3><p>Email: ${companyData.email}<br/>Phone: ${companyData.phone}<br/>Website: ${companyData.website}</p>`,
            de: `<h3>Kontaktinformationen</h3><p>E-Mail: ${companyData.email}<br/>Telefon: ${companyData.phone}<br/>Website: ${companyData.website}</p>`,
            hu: `<h3>Kapcsolati információk</h3><p>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}<br/>Weboldal: ${companyData.website}</p>`,
            cs: `<h3>Kontaktní informace</h3><p>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}<br/>Web: ${companyData.website}</p>`,
            sk: `<h3>Kontaktné informácie</h3><p>E-mail: ${companyData.email}<br/>Telefón: ${companyData.phone}<br/>Web: ${companyData.website}</p>`,
            hr: `<h3>Kontakt informacije</h3><p>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}<br/>Web: ${companyData.website}</p>`,
            ro: `<h3>Informații de contact</h3><p>Email: ${companyData.email}<br/>Telefon: ${companyData.phone}<br/>Website: ${companyData.website}</p>`,
            pl: `<h3>Informacje kontaktowe</h3><p>E-mail: ${companyData.email}<br/>Telefon: ${companyData.phone}<br/>Strona: ${companyData.website}</p>`
          }
        },
        { 
          key: 'represented', 
          order: 3, 
          title_key: 'impressum.represented_title',
          customContent: {
            en: `<h3>Represented By</h3><p>${companyData.managingDirector}</p>`,
            de: `<h3>Vertreten durch</h3><p>${companyData.managingDirector}</p>`,
            hu: `<h3>Képviseli</h3><p>${companyData.managingDirector}</p>`,
            cs: `<h3>Zastoupena</h3><p>${companyData.managingDirector}</p>`,
            sk: `<h3>Zastúpená</h3><p>${companyData.managingDirector}</p>`,
            hr: `<h3>Zastupnik</h3><p>${companyData.managingDirector}</p>`,
            ro: `<h3>Reprezentat de</h3><p>${companyData.managingDirector}</p>`,
            pl: `<h3>Reprezentowana przez</h3><p>${companyData.managingDirector}</p>`
          }
        },
        { 
          key: 'registration', 
          order: 4, 
          title_key: 'impressum.registration_title',
          customContent: {
            en: `<h3>Commercial Register</h3><p>Registered at: ${companyData.registryCourt}<br/>Registration Number: ${companyData.registrationNumber}<br/>Tax ID: ${companyData.taxId}</p>`,
            de: `<h3>Handelsregister</h3><p>Registergericht: ${companyData.registryCourt}<br/>Registernummer: ${companyData.registrationNumber}<br/>Steuernummer: ${companyData.taxId}</p>`,
            hu: `<h3>Cégjegyzék</h3><p>Bejegyző hatóság: ${companyData.registryCourt}<br/>Cégjegyzékszám: ${companyData.registrationNumber}<br/>Adószám: ${companyData.taxId}</p>`,
            cs: `<h3>Obchodní rejstřík</h3><p>Registrován u: ${companyData.registryCourt}<br/>Registrační číslo: ${companyData.registrationNumber}<br/>DIČ: ${companyData.taxId}</p>`,
            sk: `<h3>Obchodný register</h3><p>Registrovaný u: ${companyData.registryCourt}<br/>Registračné číslo: ${companyData.registrationNumber}<br/>DIČ: ${companyData.taxId}</p>`,
            hr: `<h3>Trgovački registar</h3><p>Registriran kod: ${companyData.registryCourt}<br/>Matični broj: ${companyData.registrationNumber}<br/>OIB: ${companyData.taxId}</p>`,
            ro: `<h3>Registrul Comerțului</h3><p>Înregistrat la: ${companyData.registryCourt}<br/>Număr de înregistrare: ${companyData.registrationNumber}<br/>CIF: ${companyData.taxId}</p>`,
            pl: `<h3>Rejestr handlowy</h3><p>Zarejestrowany w: ${companyData.registryCourt}<br/>Numer rejestrowy: ${companyData.registrationNumber}<br/>NIP: ${companyData.taxId}</p>`
          }
        },
        { 
          key: 'vat', 
          order: 5, 
          title_key: 'impressum.vat_title',
          customContent: {
            en: `<h3>VAT Identification</h3><p>VAT ID: ${companyData.vatId}</p>`,
            de: `<h3>Umsatzsteuer-Identifikationsnummer</h3><p>USt-IdNr.: ${companyData.vatId}</p>`,
            hu: `<h3>ÁFA azonosító</h3><p>ÁFA szám: ${companyData.vatId}</p>`,
            cs: `<h3>DIČ</h3><p>DIČ: ${companyData.vatId}</p>`,
            sk: `<h3>DIČ</h3><p>DIČ: ${companyData.vatId}</p>`,
            hr: `<h3>PDV identifikacija</h3><p>PDV ID: ${companyData.vatId}</p>`,
            ro: `<h3>Identificare TVA</h3><p>Cod TVA: ${companyData.vatId}</p>`,
            pl: `<h3>Identyfikacja VAT</h3><p>NIP: ${companyData.vatId}</p>`
          }
        },
        { 
          key: 'responsible', 
          order: 6, 
          title_key: 'impressum.responsible_title',
          customContent: {
            en: `<h3>Responsible for Content</h3><p>${companyData.managingDirector}, ${companyData.address}, ${companyData.postalCode} ${companyData.city}</p>`,
            de: `<h3>Verantwortlich für den Inhalt</h3><p>${companyData.managingDirector}, ${companyData.address}, ${companyData.postalCode} ${companyData.city}</p>`,
            hu: `<h3>Tartalomért felelős</h3><p>${companyData.managingDirector}, ${companyData.address}, ${companyData.postalCode} ${companyData.city}</p>`,
            cs: `<h3>Odpovědný za obsah</h3><p>${companyData.managingDirector}, ${companyData.address}, ${companyData.postalCode} ${companyData.city}</p>`,
            sk: `<h3>Zodpovedný za obsah</h3><p>${companyData.managingDirector}, ${companyData.address}, ${companyData.postalCode} ${companyData.city}</p>`,
            hr: `<h3>Odgovoran za sadržaj</h3><p>${companyData.managingDirector}, ${companyData.address}, ${companyData.postalCode} ${companyData.city}</p>`,
            ro: `<h3>Responsabil pentru conținut</h3><p>${companyData.managingDirector}, ${companyData.address}, ${companyData.postalCode} ${companyData.city}</p>`,
            pl: `<h3>Odpowiedzialny za treść</h3><p>${companyData.managingDirector}, ${companyData.address}, ${companyData.postalCode} ${companyData.city}</p>`
          }
        },
        { key: 'disclaimer', order: 7, title_key: 'impressum.disclaimer_title', text_key: 'impressum.disclaimer_liability_text' }
      ];

      const sectionsToInsert: any[] = [];

      // Process Privacy Policy sections
      for (const section of privacySections) {
        const translations: Record<string, string> = {};
        
        for (const lang of LANGUAGES) {
          if (section.customContent && section.customContent[lang]) {
            // Use custom content with real data
            translations[lang] = section.customContent[lang];
          } else {
            // Fall back to translation keys
            const locale = locales[lang];
            const title = locale[section.title_key] || '';
            const text = section.text_key ? (locale[section.text_key] || '') : '';
            
            translations[lang] = text 
              ? `<h3>${title}</h3>\n<p>${text}</p>` 
              : `<h3>${title}</h3>`;
          }
        }

        sectionsToInsert.push({
          content_type: 'privacy_policy',
          section_key: section.key,
          translations,
          display_order: section.order,
          is_active: true
        });
      }

      // Process Impressum sections
      for (const section of impressumSections) {
        const translations: Record<string, string> = {};
        
        for (const lang of LANGUAGES) {
          if (section.customContent && section.customContent[lang]) {
            // Use custom content with real data
            translations[lang] = section.customContent[lang];
          } else {
            // Fall back to translation keys
            const locale = locales[lang];
            const title = locale[section.title_key] || '';
            const text = section.text_key ? (locale[section.text_key] || '') : '';
            
            const formattedText = text.replace(/\n/g, '<br/>');
            translations[lang] = text 
              ? `<h3>${title}</h3>\n<p>${formattedText}</p>` 
              : `<h3>${title}</h3>`;
          }
        }

        sectionsToInsert.push({
          content_type: 'impressum',
          section_key: section.key,
          translations,
          display_order: section.order,
          is_active: true
        });
      }

      // Insert all sections
      const { error } = await supabase
        .from('legal_content')
        .insert(sectionsToInsert);

      if (error) throw error;

      toast({
        title: t('admin.success'),
        description: `Imported ${sectionsToInsert.length} sections successfully`
      });

      loadSections();
    } catch (error: any) {
      toast({
        title: t('admin.error'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const filteredSections = sections.filter(s => s.content_type === activeContentType);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Legal Content Management</h2>
          <p className="text-muted-foreground">Manage Impressum and Privacy Policy content</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={importExistingContent} disabled={importing} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {importing
              ? 'Importing...'
              : sections.length === 0
                ? 'Import Existing Content'
                : 'Re-import from translations'}
          </Button>
          <Button onClick={createNewSection}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {sections.length === 0 && !importing && (
        <Alert>
          <AlertDescription>
            The database is empty. Click "Import Existing Content" to load the current Privacy Policy and Impressum translations from your locale files, then you can edit them here.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeContentType} onValueChange={(v) => setActiveContentType(v as any)}>
        <TabsList>
          <TabsTrigger value="impressum" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Impressum
          </TabsTrigger>
          <TabsTrigger value="privacy_policy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy Policy
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeContentType} className="space-y-4 mt-6">
          <div className="grid gap-4">
            {filteredSections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{section.section_key}</CardTitle>
                      <CardDescription>Order: {section.display_order}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSectionVisibility(section)}
                      >
                        {section.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSection(section)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {section.translations['en'] || 'No English translation'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {editingSection && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>
              {editingSection.id ? 'Edit Section' : 'Create New Section'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="section_key">Section Key *</Label>
              <Input
                id="section_key"
                value={editingSection.section_key}
                onChange={(e) => setEditingSection({
                  ...editingSection,
                  section_key: e.target.value
                })}
                placeholder="e.g., company_info, contact_title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={editingSection.display_order}
                onChange={(e) => setEditingSection({
                  ...editingSection,
                  display_order: parseInt(e.target.value) || 0
                })}
              />
            </div>

            <div className="space-y-4">
              <Label>Translations</Label>
              <Tabs defaultValue="en">
                <TabsList className="grid grid-cols-4 lg:grid-cols-8">
                  {LANGUAGES.map(lang => (
                    <TabsTrigger key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {LANGUAGES.map(lang => (
                  <TabsContent key={lang} value={lang}>
                    <Textarea
                      value={editingSection.translations[lang] || ''}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        translations: {
                          ...editingSection.translations,
                          [lang]: e.target.value
                        }
                      })}
                      placeholder={`Enter content in ${lang.toUpperCase()}`}
                      rows={8}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
              <Button onClick={saveSection}>
                <Save className="w-4 h-4 mr-2" />
                Save Section
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LegalContentManager;