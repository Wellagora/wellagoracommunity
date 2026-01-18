import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Loading skeleton for program cards in marketplace
 */
export const ProgramCardSkeleton = () => (
  <Card className="overflow-hidden animate-pulse">
    <Skeleton className="h-48 w-full rounded-none" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Loading skeleton for sponsor dashboard stats
 */
export const StatCardSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-xl border-[0.5px] border-black/5 rounded-2xl">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Loading skeleton for expert studio
 */
export const ExpertStudioSkeleton = () => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    
    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </Card>
    </div>
  </div>
);

/**
 * Loading skeleton for sponsor dashboard
 */
export const SponsorDashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    
    {/* Chart and Credit Monitor */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Card>
    </div>
    
    {/* Programs Table */}
    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  </div>
);

/**
 * Loading skeleton for profile pages
 */
export const ProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Hero Section */}
    <div className="flex flex-col md:flex-row items-center gap-6 p-6">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    
    {/* Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <ProgramCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/**
 * Loading skeleton for program detail page
 */
export const ProgramDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    {/* Hero Image */}
    <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
      </div>
      
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card className="p-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </Card>
      </div>
    </div>
  </div>
);

/**
 * Grid of program card skeletons
 */
export const ProgramGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <ProgramCardSkeleton key={i} />
    ))}
  </div>
);

export default ProgramCardSkeleton;