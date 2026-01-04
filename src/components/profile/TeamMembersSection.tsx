import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Users, UserPlus, Shield, Eye, Trash2, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: string;
  invited_at: string;
  accepted_at: string | null;
  user_id: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

const TeamMembersSection = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "viewer">("viewer");
  const [isInviting, setIsInviting] = useState(false);

  // Fetch team members
  useEffect(() => {
    if (!user) return;

    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            id, email, role, status, invited_at, accepted_at, user_id
          `)
          .eq('organization_id', user.id)
          .order('invited_at', { ascending: false });

        if (error) throw error;

        // Fetch profile info for accepted members
        const membersWithProfiles = await Promise.all(
          (data || []).map(async (member) => {
            if (member.user_id) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', member.user_id)
                .single();
              
              return { ...member, profile: profileData };
            }
            return member;
          })
        );

        setMembers(membersWithProfiles);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  const handleInvite = async () => {
    if (!user || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: user.id,
          email: inviteEmail.trim().toLowerCase(),
          role: inviteRole,
          status: 'pending',
          invited_by: user.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: t('profile.invite_exists') || 'Már létezik meghívó',
            description: t('profile.invite_exists_desc') || 'Ez az email cím már meg lett hívva.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: t('profile.invite_sent') || 'Meghívó elküldve!',
          description: t('profile.invite_sent_desc') || 'A csapattag email értesítést kap.',
        });

        // Refresh members list
        setMembers(prev => [
          {
            id: crypto.randomUUID(),
            email: inviteEmail.trim().toLowerCase(),
            role: inviteRole,
            status: 'pending',
            invited_at: new Date().toISOString(),
            accepted_at: null,
            user_id: null,
          },
          ...prev,
        ]);

        setShowInviteModal(false);
        setInviteEmail("");
        setInviteRole("viewer");
      }
    } catch (error) {
      toast({
        title: t('common.error') || 'Hiba',
        description: t('profile.invite_error') || 'Nem sikerült a meghívó elküldése.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast({
        title: t('profile.member_removed') || 'Tag eltávolítva',
      });
    } catch (error) {
      toast({
        title: t('common.error') || 'Hiba',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aktív</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Függőben</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Lejárt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge className="bg-primary/20 text-primary border-primary/30">Admin</Badge>;
    }
    return <Badge variant="outline">Megtekintő</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>{t('profile.team_members') || 'Csapattagok'}</CardTitle>
          </div>
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t('profile.invite_member') || 'Tag meghívása'}
          </Button>
        </div>
        <CardDescription>
          {t('profile.team_members_desc') || 'A szervezethez tartozó tagok és meghívók'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner (current user) */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback>
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium flex items-center gap-2">
                {profile?.first_name} {profile?.last_name}
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Tulajdonos
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{profile?.email}</div>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{t('profile.no_team_members') || 'Még nincsenek csapattagok'}</p>
            <p className="text-sm">{t('profile.invite_first_member') || 'Hívd meg az első kollégádat!'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {member.profile ? (
                      <>
                        <AvatarImage src={member.profile.avatar_url || ''} />
                        <AvatarFallback>
                          {member.profile.first_name?.[0]}{member.profile.last_name?.[0]}
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback>
                        <Mail className="w-4 h-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.profile 
                        ? `${member.profile.first_name} ${member.profile.last_name}`
                        : member.email}
                      {getRoleBadge(member.role)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {member.email}
                      {getStatusBadge(member.status)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('profile.invite_team_member') || 'Csapattag meghívása'}</DialogTitle>
            <DialogDescription>
              {t('profile.invite_team_member_desc') || 'Küldj meghívót email címre'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email cím</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="kolléga@cég.hu"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Jogosultság</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "admin" | "viewer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <div>
                        <div>Admin</div>
                        <div className="text-xs text-muted-foreground">Teljes hozzáférés, szerkesztés</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <div>
                        <div>Megtekintő</div>
                        <div className="text-xs text-muted-foreground">Csak megtekintés</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Mégse
            </Button>
            <Button onClick={handleInvite} disabled={isInviting || !inviteEmail.trim()}>
              {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Meghívó küldése
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TeamMembersSection;
