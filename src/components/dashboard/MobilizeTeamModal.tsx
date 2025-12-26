import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Mail, Target, TrendingUp, Award, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";

interface MobilizeTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_role: string;
  public_display_name?: string;
}

export const MobilizeTeamModal = ({ open, onOpenChange }: MobilizeTeamModalProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { currentProject } = useProject();
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!profile?.organization_id || !open) return;

      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_organization_members_for_invitations', {
          _organization_id: profile.organization_id,
        });

        if (error) {
          toast({
            title: t('organization.error'),
            description: t('organization.failed_to_send'),
            variant: "destructive",
          });
          return;
        }

        // Filter out current user and map to TeamMember type
        const filteredMembers = (data || [])
          .filter((m: any) => m.id !== profile.id)
          .map((m: any) => ({
            id: m.id,
            first_name: m.first_name,
            last_name: m.last_name,
            email: m.email,
            user_role: m.user_role,
            public_display_name: m.public_display_name,
          }));
        setTeamMembers(filteredMembers as TeamMember[]);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    loadTeamMembers();
  }, [profile?.organization_id, open]);

  // Load challenges
  useEffect(() => {
    const loadChallenges = async () => {
      if (!open) return;

      try {
        const { data, error } = await supabase
          .from('challenge_definitions')
          .select('*')
          .eq('is_active', true)
          .eq('project_id', currentProject?.id || '')
          .limit(10);

        if (error) return;

        setChallenges(data || []);
      } catch (error) {
        // Silent error handling
      }
    };

    loadChallenges();
  }, [open]);

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === teamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(teamMembers.map(m => m.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.organization_id) {
      toast({
        title: t('organization.error'),
        description: t('organization.must_be_part_of_org'),
        variant: "destructive",
      });
      return;
    }

    const selectedChallengeData = challenges.find(c => c.id === selectedChallenge);
    if (!selectedChallengeData) return;

    setSubmitting(true);

    try {
      // Prepare invitations
      const invitations = selectedMembers.map(memberId => {
        const member = teamMembers.find(m => m.id === memberId);
        return {
          email: member!.email,
          name: member!.public_display_name || `${member!.first_name} ${member!.last_name}`,
        };
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          challengeId: selectedChallenge,
          challengeTitle: selectedChallengeData.title,
          invitations,
          message: message || undefined,
          organizationId: profile.organization_id,
        },
      });

      if (error) throw error;

      const sent = data.sent || 0;
      toast({
        title: t('organization.team_mobilized_success'),
        description: `${sent} ${sent !== 1 ? t('organization.members_invited') : t('organization.member_invited')}`,
      });
      
      onOpenChange(false);
      setSelectedChallenge("");
      setSelectedMembers([]);
      setMessage("");
    } catch (error: unknown) {
      toast({
        title: t('organization.error'),
        description: error instanceof Error ? error.message : t('organization.failed_to_send'),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedChallengeData = challenges.find(c => c.id === selectedChallenge);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {t('organization.mobilize_team_title')}
          </DialogTitle>
          <DialogDescription>
            {t('organization.mobilize_team_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challenge Selection */}
          <div className="space-y-3">
            <Label>{t('organization.select_challenge')} *</Label>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : challenges.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">{t('organization.no_challenges')}</p>
            ) : (
              <div className="space-y-2">
                {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedChallenge === challenge.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedChallenge(challenge.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {challenge.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {challenge.points_base} points
                        </Badge>
                      </div>
                    </div>
                    {selectedChallenge === challenge.id && (
                      <Award className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Member Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('organization.select_team_members')} *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedMembers.length === teamMembers.length ? t('organization.deselect_all') : t('organization.select_all')}
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center p-8 border rounded-lg">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : teamMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center border rounded-lg">{t('organization.no_team_members')}</p>
            ) : (
              <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                {teamMembers.map((member) => {
                  const displayName = member.public_display_name || `${member.first_name} ${member.last_name}`;
                  const initials = `${member.first_name[0]}${member.last_name[0]}`;
                  
                  return (
                <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleToggleMember(member.id)}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleToggleMember(member.id)}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {member.user_role}
                    </Badge>
                  </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {selectedMembers.length} {t('organization.of')} {teamMembers.length} {t('organization.members_selected')}
            </p>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">{t('organization.invitation_message')}</Label>
            <Textarea
              id="message"
              placeholder={t('organization.invitation_placeholder')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Impact Preview */}
          {selectedChallengeData && selectedMembers.length > 0 && (
            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                {t('organization.projected_team_impact')}
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold">+{selectedMembers.length}</p>
                  <p className="text-xs text-muted-foreground">{t('organization.new_participants')}</p>
                </div>
                <div>
                  <Award className="w-5 h-5 mx-auto mb-1 text-warning" />
                  <p className="text-lg font-bold">
                    {selectedChallengeData.points_base * selectedMembers.length}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('organization.total_points')}</p>
                </div>
                <div>
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-success" />
                  <p className="text-lg font-bold">
                    {selectedChallengeData.duration_days} {t('organization.days')}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('organization.challenge_duration')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Preview */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">{t('organization.team_members_receive')}</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{t('organization.email_invitation')}</li>
                  <li>{t('organization.inapp_notification')}</li>
                  <li>{t('organization.custom_message')}</li>
                  <li>{t('organization.quick_join_link')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t('organization.cancel')}
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!selectedChallenge || selectedMembers.length === 0 || submitting || loading}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('organization.sending')}
                </>
              ) : (
                `${t('organization.send_invitations')} (${selectedMembers.length})`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
