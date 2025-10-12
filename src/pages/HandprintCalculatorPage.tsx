import HandprintCalculator from '@/components/handprint/HandprintCalculator';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const HandprintCalculatorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-light-transition p-3 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Vissza a Dashboard-hoz
        </Button>
        
        <HandprintCalculator />
      </div>
    </div>
  );
};

export default HandprintCalculatorPage;
