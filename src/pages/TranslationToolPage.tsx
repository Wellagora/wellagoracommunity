import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { BulkTranslationTool } from "@/components/admin/BulkTranslationTool";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TranslationToolPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Translation Tool</h1>
            <p className="text-lg text-muted-foreground">
              Automatically translate content across all supported languages
            </p>
          </div>
        </div>

        <BulkTranslationTool />

        <div className="mt-12 p-6 bg-muted/30 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold">How to Use</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Select the source language of your text</li>
            <li>Paste or type the text you want to translate</li>
            <li>Click "Translate to All Languages" and wait for AI to generate translations</li>
            <li>Review the translations and copy individual ones or all as JSON</li>
            <li>Paste the translations into the respective language files in <code className="bg-background px-1 py-0.5 rounded">src/locales/</code></li>
          </ol>
          
          <div className="pt-4 border-t space-y-2">
            <h3 className="font-semibold">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Placeholders like {"{variable}"} or {"{{count}}"} will be preserved in translations</li>
              <li>The AI is trained on sustainability topics for better accuracy</li>
              <li>Always review AI translations for context and accuracy</li>
              <li>For technical terms, consider providing context in your source text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationToolPage;
