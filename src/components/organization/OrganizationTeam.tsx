import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  UserPlus,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Building2
} from "lucide-react";
import { format, parseISO, addDays } from "date-fns";
import { hu } from "date-fns/locale";
import { z } from "zod";

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  user_role: string;
  created_at: string;
  organization_id: string | null;
}

interface TeamInvitation {
  id: string;
  invitee_email: string;
  invitee_name: string | null;
  inviter_user_id: string;
  message: string | null;
  created_at: string;
  status: string;
  expires_at: string;
}

const inviteSchema = z.object({
  email: z.string().trim().email({ message: "Érvénytelen email cím" }).max(255),
  message: z.string().trim().max(500, { message: "Az üzenet maximum 500 karakter lehet" }).optional(),
});

const OrganizationTeam = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url, user_role, created_at, organization_id')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: true });

        if (error) {
          // Silent error handling
        } else {
          setTeamMembers(data || []);
        }
      } catch (error) {
        // Silent error handling
      }
    };

    fetchTeamMembers();
  }, [profile?.organization_id]);

  // Fetch pending invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      if (!profile?.organization_id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('team_invitations')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) {
          // Silent error handling
        } else {
          setPendingInvitations(data || []);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [profile?.organization_id]);

  const handleInviteSubmit = async () => {
    if (!user?.id || !profile?.organization_id) return;

    // Validate input
    const result = inviteSchema.safeParse({
      email: inviteEmail,
      message: inviteMessage,
    });

    if (!result.success) {
      const fieldErrors: { email?: string; message?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'email') fieldErrors.email = issue.message;
        if (issue.path[0] === 'message') fieldErrors.message = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // Create invitation
      const { error } = await supabase
        .from('team_invitations')
        .insert({
          invitee_email: inviteEmail.trim(),
          inviter_user_id: user.id,
          organization_id: profile.organization_id,
          message: inviteMessage.trim() || null,
          expires_at: addDays(new Date(), 7).toISOString(),
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Meghívó elküldve!",
        description: "Email küldés hamarosan elérhető",
      });

      // Refresh invitations list
      const { data } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (data) setPendingInvitations(data);

      // Reset form
      setInviteEmail("");
      setInviteMessage("");
      setInviteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Hiba",
        description: "Nem sikerült elküldeni a meghívót",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Meghívó visszavonva",
        description: "A meghívó sikeresen törölve",
      });

      // Refresh list
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      toast({
        title: "Hiba",
        description: "Nem sikerült visszavonni a meghívót",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleMap = {
      citizen: { label: "Állampolgár", color: "bg-muted text-muted-foreground" },
      business: { label: "Vállalkozás", color: "bg-primary/10 text-primary" },
      government: { label: "Önkormányzat", color: "bg-accent/10 text-accent" },
      ngo: { label: "Civil szervezet", color: "bg-success/10 text-success" },
    };
    
    const roleInfo = roleMap[role as keyof typeof roleMap] || { 
      label: role, 
      color: "bg-muted text-muted-foreground" 
    };
    
    return (
      <Badge variant="outline" className={roleInfo.color}>
        {roleInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy. MM. dd.', { locale: hu });
    } catch {
      return '-';
    }
  };

  const activeMembers = teamMembers.length;
  const isFirstMember = teamMembers.length > 0 && teamMembers[0].id === user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Csapattagok száma</p>
                <p className="text-4xl font-bold text-foreground">{teamMembers.length}</p>
              </div>
              <Users className="w-12 h-12 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-success/5 to-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktív tagok</p>
                <p className="text-4xl font-bold text-success">{activeMembers}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-success/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Section */}
      {isFirstMember && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Csapattagok meghívása
            </CardTitle>
            <CardDescription>
              Hívd meg kollégáidat a szervezetbe való csatlakozásra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <Mail className="w-4 h-4 mr-2" />
              Új tag meghívása
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Csapattagok</h2>
        {teamMembers.length === 0 ? (
          <Card className="border-muted">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Még nincs csapattag</h3>
              <p className="text-muted-foreground mb-6">
                Hívj meg kollégákat a szervezetedbe!
              </p>
              {isFirstMember && (
                <Button onClick={() => setInviteDialogOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Első tag meghívása
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Szerepkör</TableHead>
                      <TableHead>Csatlakozott</TableHead>
                      <TableHead>Státusz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {member.first_name?.[0]}{member.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.first_name} {member.last_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(member.user_role)}
                        </TableCell>
                        <TableCell>
                          {formatDate(member.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktív
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pending Invitations */}
      {isFirstMember && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Függő meghívók</h2>
          {pendingInvitations.length === 0 ? (
            <Card className="border-muted">
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nincsenek függő meghívók</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Üzenet</TableHead>
                        <TableHead>Meghívva</TableHead>
                        <TableHead>Lejár</TableHead>
                        <TableHead className="text-right">Művelet</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvitations.map((invitation) => (
                        <TableRow key={invitation.id}>
                          <TableCell className="font-medium">
                            {invitation.invitee_email}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {invitation.message || '-'}
                          </TableCell>
                          <TableCell>
                            {formatDate(invitation.created_at)}
                          </TableCell>
                          <TableCell>
                            {formatDate(invitation.expires_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Visszavonás
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Új tag meghívása
            </DialogTitle>
            <DialogDescription>
              Add meg a meghívni kívánt személy email címét
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email cím *</Label>
              <Input
                id="email"
                type="email"
                placeholder="pelda@email.com"
                value={inviteEmail}
                onChange={(e) => {
                  setInviteEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Üzenet (opcionális)</Label>
              <Textarea
                id="message"
                placeholder="Írj egy személyes üzenetet..."
                value={inviteMessage}
                onChange={(e) => {
                  setInviteMessage(e.target.value);
                  if (errors.message) setErrors({ ...errors, message: undefined });
                }}
                rows={4}
                maxLength={500}
                className={errors.message ? "border-destructive" : ""}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {inviteMessage.length}/500 karakter
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setInviteDialogOpen(false);
                setInviteEmail("");
                setInviteMessage("");
                setErrors({});
              }}
            >
              Mégse
            </Button>
            <Button 
              onClick={handleInviteSubmit}
              disabled={submitting}
            >
              {submitting ? (
                "Küldés..."
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Meghívó küldése
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationTeam;
