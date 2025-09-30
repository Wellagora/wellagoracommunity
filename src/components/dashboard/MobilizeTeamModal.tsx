import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Mail, Target, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MobilizeTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockTeamMembers = [
  { id: "1", name: "Sarah Johnson", email: "sarah.j@company.com", role: "HR Manager", department: "HR" },
  { id: "2", name: "Mike Chen", email: "mike.c@company.com", role: "Senior Developer", department: "IT" },
  { id: "3", name: "Emma Davis", email: "emma.d@company.com", role: "Marketing Lead", department: "Marketing" },
  { id: "4", name: "James Wilson", email: "james.w@company.com", role: "Operations Manager", department: "Operations" },
  { id: "5", name: "Lisa Anderson", email: "lisa.a@company.com", role: "Finance Director", department: "Finance" },
];

const mockChallenges = [
  { id: "c1", title: "Green Office Initiative", participants: 342, co2: 18.5 },
  { id: "c2", title: "Bike to Work Campaign", participants: 156, co2: 8.2 },
  { id: "c3", title: "Zero Waste Week", participants: 89, co2: 4.3 },
];

export const MobilizeTeamModal = ({ open, onOpenChange }: MobilizeTeamModalProps) => {
  const { toast } = useToast();
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const handleToggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === mockTeamMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(mockTeamMembers.map(m => m.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Team Mobilized Successfully!",
      description: `${selectedMembers.length} team members have been invited to join the challenge.`,
    });
    
    onOpenChange(false);
    setSelectedChallenge("");
    setSelectedMembers([]);
    setMessage("");
  };

  const selectedChallengeData = mockChallenges.find(c => c.id === selectedChallenge);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Mobilize Your Team
          </DialogTitle>
          <DialogDescription>
            Invite team members to join a sustainability challenge
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challenge Selection */}
          <div className="space-y-3">
            <Label>Select Challenge *</Label>
            <div className="space-y-2">
              {mockChallenges.map((challenge) => (
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
                      <div className="flex gap-4 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {challenge.participants} participants
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {challenge.co2}t CO₂
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
          </div>

          {/* Team Member Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Team Members *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedMembers.length === mockTeamMembers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {mockTeamMembers.map((member) => (
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
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.department}
                  </Badge>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedMembers.length} of {mockTeamMembers.length} members selected
            </p>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Invitation Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to inspire your team..."
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
                Projected Team Impact
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <p className="text-lg font-bold">+{selectedMembers.length}</p>
                  <p className="text-xs text-muted-foreground">New participants</p>
                </div>
                <div>
                  <TrendingUp className="w-5 h-5 mx-auto mb-1 text-success" />
                  <p className="text-lg font-bold">
                    ~{(selectedChallengeData.co2 * selectedMembers.length / selectedChallengeData.participants).toFixed(1)}t
                  </p>
                  <p className="text-xs text-muted-foreground">Est. CO₂ saved</p>
                </div>
                <div>
                  <Award className="w-5 h-5 mx-auto mb-1 text-warning" />
                  <p className="text-lg font-bold">
                    +{Math.round(selectedMembers.length / selectedChallengeData.participants * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Impact boost</p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Preview */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Team members will receive:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Email invitation with challenge details</li>
                  <li>In-app notification</li>
                  <li>Your custom message (if provided)</li>
                  <li>Quick join link</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!selectedChallenge || selectedMembers.length === 0}
            >
              Send Invitations ({selectedMembers.length})
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
