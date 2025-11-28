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
      console.error('Error loading legal sections:', error);
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
      console.error('Error saving section:', error);
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
      console.error('Error deleting section:', error);
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
      console.error('Error toggling visibility:', error);
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
      // Import all locale files
      const locales: Record<string, any> = {
        en: await import('@/locales/en.json'),
        de: await import('@/locales/de.json'),
        hu: await import('@/locales/hu.json'),
        cs: await import('@/locales/cs.json'),
        sk: await import('@/locales/sk.json'),
        hr: await import('@/locales/hr.json'),
        ro: await import('@/locales/ro.json'),
        pl: await import('@/locales/pl.json')
      };

      // Privacy Policy sections
      const privacySections = [
        { key: 'intro', order: 1, title_key: 'intro_title', text_key: 'intro_text' },
        { key: 'controller', order: 2, title_key: 'controller_title', text_key: 'controller_text' },
        { key: 'data_collected', order: 3, title_key: 'data_collected_title', text_key: 'data_collected_intro' },
        { key: 'purpose', order: 4, title_key: 'purpose_title', text_key: null },
        { key: 'legal_basis', order: 5, title_key: 'legal_basis_title', text_key: null },
        { key: 'sharing', order: 6, title_key: 'sharing_title', text_key: 'sharing_intro' },
        { key: 'retention', order: 7, title_key: 'retention_title', text_key: 'retention_text' },
        { key: 'rights', order: 8, title_key: 'rights_title', text_key: 'rights_intro' },
        { key: 'security', order: 9, title_key: 'security_title', text_key: 'security_text' },
        { key: 'cookies', order: 10, title_key: 'cookies_title', text_key: 'cookies_text' },
        { key: 'changes', order: 11, title_key: 'changes_title', text_key: 'changes_text' },
        { key: 'contact', order: 12, title_key: 'contact_title', text_key: 'contact_text' }
      ];

      // Impressum sections
      const impressumSections = [
        { key: 'company_info', order: 1, title_key: 'company_info', text_key: 'company_details' },
        { key: 'contact', order: 2, title_key: 'contact_title', text_key: 'contact_info' },
        { key: 'registry', order: 3, title_key: 'registry_title', text_key: 'registry_info' },
        { key: 'tax', order: 4, title_key: 'tax_title', text_key: 'tax_number' },
        { key: 'responsible', order: 5, title_key: 'responsible_title', text_key: 'responsible_person' },
        { key: 'disclaimer', order: 6, title_key: 'disclaimer_title', text_key: 'disclaimer_text' }
      ];

      const sectionsToInsert: any[] = [];

      // Process Privacy Policy sections
      for (const section of privacySections) {
        const translations: Record<string, string> = {};
        
        for (const lang of LANGUAGES) {
          const locale = locales[lang];
          const title = locale.privacy?.[section.title_key] || '';
          const text = section.text_key ? locale.privacy?.[section.text_key] || '' : '';
          
          // Combine title and text with HTML formatting
          translations[lang] = `<h3>${title}</h3>\n${text}`;
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
          const locale = locales[lang];
          const title = locale.impressum?.[section.title_key] || '';
          const text = locale.impressum?.[section.text_key] || '';
          
          translations[lang] = `<h3>${title}</h3>\n${text}`;
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
      console.error('Error importing content:', error);
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
          {sections.length === 0 && (
            <Button onClick={importExistingContent} disabled={importing} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              {importing ? 'Importing...' : 'Import Existing Content'}
            </Button>
          )}
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