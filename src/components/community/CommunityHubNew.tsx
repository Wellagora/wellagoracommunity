import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rss, ImageIcon } from "lucide-react";
import CommunityFeed from './CommunityFeed';
import CommunityGallery from './CommunityGallery';
import CommunityEvents from './CommunityEvents';
import CommunityCTA from './CommunityCTA';
import { CommunityHeader } from './CommunityHeader';

const CommunityHubNew = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-background">
      {/* Community Header with Stats and Expert Gallery */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-card/95 to-background/95 backdrop-blur-sm py-8 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4">
          <CommunityHeader />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="feed" className="gap-2">
              <Rss className="w-4 h-4" />
              {t('community.tab_feed') || 'Fal'}
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              {t('community.tab_gallery') || 'Galéria'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-0">
            <CommunityFeed />
          </TabsContent>

          <TabsContent value="gallery" className="mt-0">
            <CommunityGallery />
          </TabsContent>
        </Tabs>
      </div>

      {/* Upcoming Events and CTA */}
      <div className="container mx-auto px-4 space-y-8 pb-12">
        <CommunityEvents />
        <CommunityCTA />
      </div>
    </div>
  );
};

export default CommunityHubNew;
