import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Copy, Check, Languages, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LANGUAGES = {
  hu: "Hungarian",
  de: "German",
  en: "English",
  cs: "Czech",
  sk: "Slovak",
  hr: "Croatian",
  ro: "Romanian",
  pl: "Polish",
};

export function BulkTranslationTool() {
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [sourceText, setSourceText] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedLang, setCopiedLang] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    setTranslations({});

    try {
      const { data, error } = await supabase.functions.invoke("bulk-translate", {
        body: {
          sourceLanguage,
          sourceText: sourceText.trim(),
        },
      });

      if (error) {
        // Handle rate limiting
        if (error.message?.includes("Rate limits exceeded")) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
          return;
        }

        // Handle payment required
        if (error.message?.includes("Payment required")) {
          toast({
            title: "Credits Required",
            description: "Please add credits to your Lovable AI workspace in Settings.",
            variant: "destructive",
          });
          return;
        }

        throw error;
      }

      if (!data?.translations) {
        throw new Error("No translations returned");
      }

      setTranslations(data.translations);
      toast({
        title: "Success!",
        description: `Translated to ${Object.keys(data.translations).length} languages`,
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = async (langCode: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedLang(langCode);
    setTimeout(() => setCopiedLang(null), 2000);
    toast({
      title: "Copied!",
      description: `${LANGUAGES[langCode as keyof typeof LANGUAGES]} translation copied to clipboard`,
    });
  };

  const copyAllAsJSON = async () => {
    const jsonOutput = Object.entries(translations).map(([lang, text]) => {
      return `  "${lang}": "${text.replace(/"/g, '\\"')}"`;
    }).join(',\n');
    
    await navigator.clipboard.writeText(`{\n${jsonOutput}\n}`);
    toast({
      title: "Copied!",
      description: "All translations copied as JSON",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Languages className="w-6 h-6 text-primary" />
          <CardTitle>AI Bulk Translation Tool</CardTitle>
        </div>
        <CardDescription>
          Automatically translate content across all 8 supported languages using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Sparkles className="w-4 h-4" />
          <AlertDescription>
            This tool uses Lovable AI to translate your content. Translations are optimized for sustainability and environmental topics.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Source Language</label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Text to Translate</label>
            <Textarea
              placeholder="Enter the text you want to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Tip: You can include placeholders like {"{variable}"} or {"{{interpolation}}"} - they will be preserved
            </p>
          </div>

          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !sourceText.trim()}
            className="w-full"
            size="lg"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-2" />
                Translate to All Languages
              </>
            )}
          </Button>
        </div>

        {Object.keys(translations).length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Translations</h3>
              <Button onClick={copyAllAsJSON} variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Copy All as JSON
              </Button>
            </div>

            <div className="space-y-3">
              {Object.entries(translations).map(([langCode, text]) => (
                <div key={langCode} className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-semibold">
                      {LANGUAGES[langCode as keyof typeof LANGUAGES]} ({langCode})
                    </Badge>
                    <Button
                      onClick={() => copyToClipboard(langCode, text)}
                      variant="ghost"
                      size="sm"
                    >
                      {copiedLang === langCode ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm font-mono bg-background p-3 rounded border">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
