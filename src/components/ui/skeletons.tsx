import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for stat cards (used in Index.tsx community stats)
 */
export const StatCardSkeleton = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div>
      <Skeleton className="h-6 w-12 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

/**
 * Skeleton for challenge/program cards
 */
export const ChallengeCardSkeleton = () => (
  <Card className="bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
    {/* Image placeholder */}
    <Skeleton className="h-48 sm:h-56 lg:h-64 w-full rounded-none" />
    
    <CardHeader className="pb-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </CardHeader>

    <CardContent className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Sponsor badge placeholder */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* Participants preview */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Action button */}
      <Skeleton className="h-10 w-full rounded-md" />
    </CardContent>
  </Card>
);

/**
 * Skeleton for profile/stakeholder cards
 */
export const ProfileCardSkeleton = () => (
  <Card className="hover:shadow-lg transition-all border-2">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex flex-wrap gap-1 mb-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
    </CardContent>
  </Card>
);

/**
 * Skeleton for map loading state
 */
export const MapSkeleton = () => (
  <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
    <Skeleton className="w-full h-full" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>
    </div>
  </div>
);

/**
 * Grid of challenge card skeletons
 */
export const ChallengeGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
    {Array.from({ length: count }).map((_, i) => (
      <ChallengeCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Grid of profile card skeletons
 */
export const ProfileGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProfileCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Stats bar skeleton (horizontal layout)
 */
export const StatsBarSkeleton = () => (
  <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
    <StatCardSkeleton />
    <StatCardSkeleton />
    <StatCardSkeleton />
  </div>
);

/**
 * Skeleton for program cards in marketplace
 */
export const ProgramCardSkeleton = () => (
  <Card className="bg-[#112240] border-[hsl(var(--cyan))]/10 overflow-hidden">
    <Skeleton className="aspect-video w-full bg-[#1a3a5c]" />
    <CardContent className="p-4">
      <Skeleton className="h-5 w-3/4 mb-2 bg-[#1a3a5c]" />
      <Skeleton className="h-4 w-1/2 mb-3 bg-[#1a3a5c]" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 bg-[#1a3a5c]" />
        <Skeleton className="h-6 w-20 bg-[#1a3a5c]" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Skeleton for creator profile header
 */
export const CreatorCardSkeleton = () => (
  <div className="bg-[#112240] rounded-xl p-8">
    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
      <Skeleton className="w-24 h-24 rounded-full bg-[#1a3a5c]" />
      <div className="text-center md:text-left">
        <Skeleton className="h-8 w-48 mb-2 bg-[#1a3a5c]" />
        <Skeleton className="h-4 w-32 bg-[#1a3a5c]" />
      </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 rounded-lg bg-[#1a3a5c]" />
      ))}
    </div>
    <Skeleton className="h-32 w-full bg-[#1a3a5c]" />
  </div>
);

/**
 * Skeleton for review cards
 */
export const ReviewCardSkeleton = () => (
  <Card className="bg-[#112240]/50 border-[hsl(var(--cyan))]/10">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-full bg-[#1a3a5c]" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-32 bg-[#1a3a5c]" />
            <Skeleton className="h-4 w-24 bg-[#1a3a5c]" />
          </div>
          <Skeleton className="h-4 w-full mb-2 bg-[#1a3a5c]" />
          <Skeleton className="h-4 w-3/4 bg-[#1a3a5c]" />
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Grid of program card skeletons
 */
export const ProgramGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProgramCardSkeleton key={i} />
    ))}
  </div>
);

/**
 * Grid of review card skeletons
 */
export const ReviewListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <ReviewCardSkeleton key={i} />
    ))}
  </div>
);
