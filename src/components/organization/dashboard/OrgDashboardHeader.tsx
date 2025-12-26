import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  Target, 
  Handshake,
  Edit3
} from "lucide-react";

interface Profile {
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
  user_role?: string;
  organization?: string | null;
}

interface RoleInfo {
  title: string;
  subtitle: string;
  gradient: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface OrgDashboardHeaderProps {
  profile: Profile | null;
  roleInfo: RoleInfo;
  partnerships: { length: number };
  t: (key: string) => string;
}

export const OrgDashboardHeader = ({ 
  profile, 
  roleInfo, 
  partnerships,
  t 
}: OrgDashboardHeaderProps) => {
  const RoleIcon = roleInfo.icon;
  
  // Regional stats - only real data
  const totalParticipants = 0;
  const activeChallenges = 0;

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 xl:mb-16">
        <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 bg-gradient-to-r ${roleInfo.gradient} rounded-2xl shadow-elegant mb-4 sm:mb-6 xl:mb-8`}>
          <RoleIcon className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold text-foreground mb-2 sm:mb-4 xl:mb-6">
          {roleInfo.title}
        </h1>
        <p className="text-lg sm:text-xl xl:text-2xl text-muted-foreground max-w-2xl xl:max-w-3xl mx-auto px-4">
          {roleInfo.subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Badge className={`bg-gradient-to-r ${roleInfo.gradient} text-white px-3 sm:px-4 py-1.5 sm:py-2`}>
            {profile?.organization || t('organization.organization')}
          </Badge>
        </div>
      </div>

      {/* Regional Impact Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Profile Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">{t('organization.my_profile')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-base">
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-sm truncate">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-xs text-primary capitalize">
                  {profile?.user_role === 'business' ? t('organization.role_business') :
                   profile?.user_role === 'government' ? t('organization.role_government') :
                   profile?.user_role === 'ngo' ? t('organization.role_ngo') : profile?.user_role}
                </p>
                {profile?.organization && (
                  <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                    <Building2 className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{profile.organization}</span>
                  </div>
                )}
              </div>
            </div>
            <Link to="/profile" className="block">
              <Button size="sm" className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-xs">
                <Edit3 className="w-3 h-3 mr-1.5" />
                {t('organization.edit_profile')}
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.active_challenges')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{activeChallenges}</p>
              </div>
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.people_reached')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-success">{totalParticipants}</p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('organization.partnerships')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-accent">{partnerships.length}</p>
              </div>
              <Handshake className="w-8 h-8 sm:w-10 sm:h-10 text-accent/60" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
