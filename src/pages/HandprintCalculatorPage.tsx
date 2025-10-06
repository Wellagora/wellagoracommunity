import HandprintCalculator from '@/components/handprint/HandprintCalculator';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const HandprintCalculatorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-light-transition p-6">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza a Dashboard-hoz
        </Button>
        
        <HandprintCalculator />
      </div>
    </div>
  );
};

export default HandprintCalculatorPage;
