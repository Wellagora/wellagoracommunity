import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import HandprintCalculator from '@/components/dashboard/HandprintCalculator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const HandprintPage = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const isOrganization = profile?.user_role && ['business', 'government', 'ngo'].includes(profile.user_role);

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h1 className="text-3xl font-bold mb-4 text-foreground">
            🔐 {t('auth.login_required')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('handprint.login_message')}
          </p>
          <Button onClick={() => navigate('/auth')} size="lg">
            {t('auth.login')}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-2xl text-foreground">⏳ {t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back_to_dashboard')}
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              {isOrganization ? `🌍 ${t('handprint.regional_impact')}` : `🌱 ${t('handprint.title')}`}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isOrganization 
                ? t('handprint.regional_description')
                : t('handprint.description')
              }
            </p>
          </div>
        </div>

        {/* Calculator Component */}
        <HandprintCalculator />
      </div>
    </div>
  );
};

export default HandprintPage;
