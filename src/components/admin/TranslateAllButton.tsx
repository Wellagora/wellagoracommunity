import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Languages, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateAllUntranslatedContent } from '@/services/translationService';

interface TranslationResult {
  contentsTranslated: number;
  profilesTranslated: number;
}

const TranslateAllButton = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);

  const handleTranslateAll = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await translateAllUntranslatedContent();
      setResult(res);
      toast.success(
        t('admin.translation_success')
          .replace('{{contents}}', String(res.contentsTranslated))
          .replace('{{profiles}}', String(res.profilesTranslated))
      );
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(t('admin.translation_error'));
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5" />
          {t('admin.translate_all_title')}
        </CardTitle>
        <CardDescription>
          {t('admin.translate_all_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTranslateAll} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('admin.translating')}
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              {t('admin.translate_all_button')}
            </>
          )}
        </Button>
        {result && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            {t('admin.translation_success')
              .replace('{{contents}}', String(result.contentsTranslated))
              .replace('{{profiles}}', String(result.profilesTranslated))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslateAllButton;
