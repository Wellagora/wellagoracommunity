import { useState } from "react";
import { useCommunityHub } from "@/hooks/useCommunityHub";
import CommunityHeader from "./hub/CommunityHeader";
import CommunityOverview from "./hub/CommunityOverview";
import CommunityForums from "./hub/CommunityForums";
import CommunityStakeholders from "./hub/CommunityStakeholders";
import CommunityEvents from "./hub/CommunityEvents";
import CommunityStoryBook from "./hub/CommunityStoryBook";

type ViewType = "overview" | "forums" | "partners" | "events";

const UnifiedCommunityHub = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<ViewType>("overview");
  const [isStoryBookOpen, setIsStoryBookOpen] = useState(false);
  
  const {
    stakeholders,
    loadingStakeholders,
    forums,
    upcomingEvents,
    currentProject
  } = useCommunityHub();

  const handleBack = () => setActiveView("overview");

  return (
    <div className="min-h-screen bg-background">
      <CommunityHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        regionName={currentProject?.region_name}
      />

      <div className="container mx-auto px-4 py-12">
        {activeView === "overview" && (
          <CommunityOverview
            stakeholderCount={stakeholders.length}
            onViewChange={setActiveView}
            onOpenStoryBook={() => setIsStoryBookOpen(true)}
          />
        )}

        {activeView === "forums" && (
          <CommunityForums
            forums={forums}
            onBack={handleBack}
          />
        )}

        {activeView === "partners" && (
          <CommunityStakeholders
            stakeholders={stakeholders}
            loading={loadingStakeholders}
            onBack={handleBack}
          />
        )}

        {activeView === "events" && (
          <CommunityEvents
            events={upcomingEvents}
            onBack={handleBack}
          />
        )}
      </div>

      <CommunityStoryBook
        open={isStoryBookOpen}
        onOpenChange={setIsStoryBookOpen}
      />
    </div>
  );
};

export default UnifiedCommunityHub;
