import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import Community from "./pages/Community";
import AIAssistant from "./pages/AIAssistant";
import AuthPage from "./pages/AuthPage";
import ChallengesPage from "./pages/ChallengesPage";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/challenges" element={<ChallengesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;