import HandprintCalculator from '@/components/handprint/HandprintCalculator';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const HandprintCalculatorPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-light-transition p-3 sm:p-6 xl:p-8">
      <div className="container mx-auto max-w-4xl xl:max-w-5xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4 sm:mb-6 xl:mb-8 text-sm sm:text-base xl:text-lg"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 xl:w-5 xl:h-5 mr-2" />
          {t('common.back_to_dashboard')}
        </Button>
        
        <HandprintCalculator />
      </div>
    </div>
  );
};

export default HandprintCalculatorPage;
