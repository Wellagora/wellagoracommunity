import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, ChevronLeft } from 'lucide-react';

const AdminCenterLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-slate-900 dark:text-slate-100" />
            <div>
              <div className="text-xs text-muted-foreground">Strategic</div>
              <div className="font-semibold">Admin Center</div>
            </div>
          </div>

          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Admin Panel
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminCenterLayout;
