import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AppLayout() {
  const { isDemoMode } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <header>
        <Navigation />
      </header>
      <main className={`${isDemoMode ? 'pt-20 md:pt-22' : 'pt-12 md:pt-14'}`}>
        <Outlet />
      </main>
    </div>
  );
}
