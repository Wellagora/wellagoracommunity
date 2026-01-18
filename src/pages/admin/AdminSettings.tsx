import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Settings,
  Info,
  Bot,
  Leaf,
  Ticket,
  ExternalLink,
} from 'lucide-react';

const AdminSettings = () => {
  const { t } = useLanguage();
  const { isDemoMode } = useAuth();

  // Feature toggles (demo only)
  const [features, setFeatures] = useState({
    wellbot: true,
    carbonHandprint: true,
    vouchers: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          {t('admin.settings.title')}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      {/* Platform Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('admin.settings.platform_info')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <p className="font-medium text-lg">WellAgora</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verzió</p>
              <p className="font-medium text-lg">1.0.0-beta</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Környezet</p>
              <Badge variant={isDemoMode ? 'secondary' : 'default'}>
                {isDemoMode ? 'Demo' : 'Production'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles - Demo only */}
      {isDemoMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.settings.features')}</CardTitle>
            <CardDescription>
              Ezek a beállítások csak demo módban láthatók.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">WellBot AI Asszisztens</p>
                  <p className="text-sm text-muted-foreground">
                    AI-alapú segítség a felhasználóknak
                  </p>
                </div>
              </div>
              <Switch
                checked={features.wellbot}
                onCheckedChange={() => toggleFeature('wellbot')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Karbon Kéznyom</p>
                  <p className="text-sm text-muted-foreground">
                    Pozitív környezeti hatás követése
                  </p>
                </div>
              </div>
              <Switch
                checked={features.carbonHandprint}
                onCheckedChange={() => toggleFeature('carbonHandprint')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Ticket className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Támogatott helyek rendszere</p>
                  <p className="text-sm text-muted-foreground">
                    Szponzorált program hozzáférés
                  </p>
                </div>
              </div>
              <Switch
                checked={features.vouchers}
                onCheckedChange={() => toggleFeature('vouchers')}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>További beállítások</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-3">
            A teljes platform konfiguráció a Supabase admin felületen érhető el:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Adatbázis kezelés és migrációk</li>
            <li>Felhasználói jogosultságok (RLS)</li>
            <li>Edge Functions és API kulcsok</li>
            <li>Storage és fájlkezelés</li>
          </ul>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-primary hover:underline"
          >
            Supabase Dashboard megnyitása
            <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AdminSettings;
