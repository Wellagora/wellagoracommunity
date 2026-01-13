import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface AdminPlaceholderProps {
  titleKey: string;
}

const AdminPlaceholder = ({ titleKey }: AdminPlaceholderProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t(titleKey)}
        </h1>
      </div>

      <Card>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <Construction className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {t('admin.placeholder.coming_soon')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlaceholder;
