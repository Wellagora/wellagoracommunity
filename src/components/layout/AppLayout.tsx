import { Outlet } from "react-router-dom";
import Navigation from "@/components/Navigation";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header>
        <Navigation />
      </header>
      <main className="pt-12 md:pt-14">
        <Outlet />
      </main>
    </div>
  );
}
