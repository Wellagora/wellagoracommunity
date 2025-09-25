import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import Community from "./pages/Community";
import AIAssistant from "./pages/AIAssistant";
import AuthPage from "./pages/AuthPage";
import ChallengesPage from "./pages/ChallengesPage";
import "./index.css";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/community" element={<Community />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/challenges" element={<ChallengesPage />} />
            </Routes>
            <Toaster />
            <SonnerToaster />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;