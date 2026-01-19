import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Database, 
  Trash2, 
  Loader2, 
  AlertTriangle,
  CheckCircle2,
  Beaker
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SeedResult {
  sponsors: number;
  experts: number;
  members: number;
  programs: number;
  sponsorships: number;
  transactions: number;
  noShowTransactions: number;
}

/**
 * TestDataManager - Super Admin E2E Testing Tool
 * 
 * Provides seed and wipe functionality for test data:
 * - 3 Sponsors with 150k/480k packages
 * - 5 Experts with 2-3 programs each
 * - 10 Members with simulated savings
 * - 50 Transactions (including 3-4 No-Shows)
 */
const TestDataManager = () => {
  const { language } = useLanguage();
  const [seeding, setSeeding] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [wipingAdmin, setWipingAdmin] = useState(false);
  const [lastResult, setLastResult] = useState<SeedResult | null>(null);

  const handleSeedData = async () => {
    setSeeding(true);
    setLastResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('seed-test-data', {
        body: { action: 'seed' },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to seed data');
      }

      if (response.data?.success) {
        setLastResult(response.data.created);
        toast.success(
          language === 'hu' 
            ? 'Teszt adatok sikeresen létrehozva!' 
            : 'Test data seeded successfully!'
        );
      } else {
        throw new Error(response.data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Seed error:', error);
      toast.error(
        language === 'hu' 
          ? 'Hiba történt az adatok létrehozása során' 
          : 'Error seeding test data'
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleWipeData = async () => {
    setWiping(true);
    setLastResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('seed-test-data', {
        body: { action: 'wipe' },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to wipe data');
      }

      if (response.data?.success) {
        toast.success(
          language === 'hu' 
            ? 'Teszt adatok sikeresen törölve!' 
            : 'Test data wiped successfully!'
        );
      } else {
        throw new Error(response.data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Wipe error:', error);
      toast.error(
        language === 'hu' 
          ? 'Hiba történt az adatok törlése során' 
          : 'Error wiping test data'
      );
    } finally {
      setWiping(false);
    }
  };

  // Wipe only TEST_ADMIN_ prefixed data (from Super Admin migrations)
  const handleWipeAdminData = async () => {
    setWipingAdmin(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('seed-test-data', {
        body: { action: 'wipe_admin' },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to wipe admin test data');
      }

      if (response.data?.success) {
        toast.success(
          language === 'hu' 
            ? 'Admin teszt adatok sikeresen törölve!' 
            : 'Admin test data wiped successfully!'
        );
      } else {
        throw new Error(response.data?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Wipe admin error:', error);
      toast.error(
        language === 'hu' 
          ? 'Hiba történt az admin teszt adatok törlése során' 
          : 'Error wiping admin test data'
      );
    } finally {
      setWipingAdmin(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <Beaker className="w-5 h-5" />
          {language === 'hu' ? 'E2E Teszt Adatok' : 'E2E Test Data'}
          <Badge variant="outline" className="ml-2 border-amber-500 text-amber-700">
            DEV ONLY
          </Badge>
        </CardTitle>
        <CardDescription className="text-amber-600">
          {language === 'hu' 
            ? 'Teszt adatok generálása az üzleti logika validálásához (80/20 split, kredit rendszer, No-Show kezelés)'
            : 'Generate test data to validate business logic (80/20 split, credit system, No-Show handling)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Data Specification */}
        <div className="p-4 rounded-xl bg-white/70 border border-amber-200">
          <h4 className="font-semibold text-foreground mb-3">
            {language === 'hu' ? 'Generált adatok:' : 'Generated data:'}
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span><strong>3</strong> {language === 'hu' ? 'Szponzor' : 'Sponsors'} (150k/480k {language === 'hu' ? 'csomagokkal' : 'packages'})</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span><strong>5</strong> {language === 'hu' ? 'Szakértő' : 'Experts'} (2-3 {language === 'hu' ? 'programmal' : 'programs each'})</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span><strong>10</strong> {language === 'hu' ? 'Tag' : 'Members'} ({language === 'hu' ? 'megtakarításokkal' : 'with savings'})</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span><strong>50</strong> {language === 'hu' ? 'Tranzakció' : 'Transactions'} (80/20 split, 30 {language === 'hu' ? 'nap' : 'days'})</span>
            </li>
            <li className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span><strong>3-4</strong> No-Show ({language === 'hu' ? 'Felhasznált kredit teszteléshez' : 'Consumed credit testing'})</span>
            </li>
          </ul>
        </div>

        {/* Last Result */}
        {lastResult && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <h4 className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {language === 'hu' ? 'Utolsó generálás eredménye:' : 'Last seed result:'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="p-2 bg-white rounded">
                <span className="text-muted-foreground">{language === 'hu' ? 'Szponzorok' : 'Sponsors'}:</span>
                <span className="font-bold ml-1">{lastResult.sponsors}</span>
              </div>
              <div className="p-2 bg-white rounded">
                <span className="text-muted-foreground">{language === 'hu' ? 'Szakértők' : 'Experts'}:</span>
                <span className="font-bold ml-1">{lastResult.experts}</span>
              </div>
              <div className="p-2 bg-white rounded">
                <span className="text-muted-foreground">{language === 'hu' ? 'Tagok' : 'Members'}:</span>
                <span className="font-bold ml-1">{lastResult.members}</span>
              </div>
              <div className="p-2 bg-white rounded">
                <span className="text-muted-foreground">{language === 'hu' ? 'Tranzakciók' : 'Transactions'}:</span>
                <span className="font-bold ml-1">{lastResult.transactions}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            onClick={handleSeedData}
            disabled={seeding || wiping || wipingAdmin}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {seeding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === 'hu' ? 'Generálás...' : 'Seeding...'}
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                {language === 'hu' ? 'TESZT ADATOK GENERÁLÁSA' : 'GENERATE TEST DATA'}
              </>
            )}
          </Button>

          {/* Wipe TEST_ADMIN_ data (from Super Admin migrations) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={seeding || wiping || wipingAdmin}
                className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                {wipingAdmin ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'hu' ? 'Törlés...' : 'Wiping...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'hu' ? 'ADMIN TESZT TÖRLÉSE' : 'WIPE ADMIN TEST DATA'}
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-indigo-600">
                  <AlertTriangle className="w-5 h-5" />
                  {language === 'hu' ? 'Admin teszt adatok törlése' : 'Wipe Admin Test Data'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'hu' 
                    ? 'Ez a művelet törli az összes TEST_ADMIN_ prefixszel jelölt adatot (Öko Kert, Béke Biztosító, stb.). A valódi tartalom megmarad.'
                    : 'This will delete all data marked with TEST_ADMIN_ prefix (Öko Kert, Béke Biztosító, etc.). Real content will remain.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {language === 'hu' ? 'Mégse' : 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleWipeAdminData}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {language === 'hu' ? 'Igen, törlés' : 'Yes, wipe data'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={seeding || wiping || wipingAdmin}
                className="bg-red-600 hover:bg-red-700"
              >
                {wiping ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'hu' ? 'Törlés...' : 'Wiping...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'hu' ? 'TESZT ADATOK TÖRLÉSE' : 'WIPE ALL TEST DATA'}
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  {language === 'hu' ? 'Teszt adatok törlése' : 'Wipe Test Data'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {language === 'hu' 
                    ? 'Ez a művelet VÉGLEGESEN törli az összes TEST_ prefixszel jelölt teszt adatot. A valódi felhasználói adatok NEM lesznek érintve. Biztosan folytatja?'
                    : 'This will PERMANENTLY delete all test data marked with TEST_ prefix. Real user data will NOT be affected. Are you sure?'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {language === 'hu' ? 'Mégse' : 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleWipeData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {language === 'hu' ? 'Igen, törlés' : 'Yes, wipe data'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Warning */}
        <p className="text-xs text-amber-600 mt-2">
          ⚠️ {language === 'hu' 
            ? 'Csak tesztelési célokra! A generált adatok TEST_ prefixszel vannak megjelölve és könnyen eltávolíthatók.'
            : 'For testing purposes only! Generated data is marked with TEST_ prefix and can be easily removed.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default TestDataManager;
