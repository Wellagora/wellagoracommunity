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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award, Target, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SponsorChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SponsorChallengeModal = ({ open, onOpenChange }: SponsorChallengeModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "7",
    sponsorshipAmount: "",
    targetParticipants: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Challenge Sponsored Successfully!",
      description: `"${formData.title}" has been created and is now live in your region.`,
    });
    
    onOpenChange(false);
    setFormData({
      title: "",
      description: "",
      category: "",
      duration: "7",
      sponsorshipAmount: "",
      targetParticipants: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Sponsor a Challenge
          </DialogTitle>
          <DialogDescription>
            Create and sponsor a sustainability challenge for your regional community
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challenge Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Challenge Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Green Office Energy Week"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the challenge goals and activities..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energy">Energy</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="waste">Waste Reduction</SelectItem>
                    <SelectItem value="water">Water Conservation</SelectItem>
                    <SelectItem value="food">Sustainable Food</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (days) *</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sponsorship Details */}
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Sponsorship Details
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsorshipAmount">Sponsorship Amount ($)</Label>
                <Input
                  id="sponsorshipAmount"
                  type="number"
                  placeholder="5000"
                  value={formData.sponsorshipAmount}
                  onChange={(e) => setFormData({ ...formData, sponsorshipAmount: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">For prizes and incentives</p>
              </div>

              <div>
                <Label htmlFor="targetParticipants">Target Participants</Label>
                <Input
                  id="targetParticipants"
                  type="number"
                  placeholder="500"
                  value={formData.targetParticipants}
                  onChange={(e) => setFormData({ ...formData, targetParticipants: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">Expected reach</p>
              </div>
            </div>
          </div>

          {/* Impact Projection */}
          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
            <h4 className="font-semibold text-sm mb-3">Projected Regional Impact</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-bold">{formData.targetParticipants || "500"}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
              <div>
                <Award className="w-5 h-5 mx-auto mb-1 text-warning" />
                <p className="text-lg font-bold">${formData.sponsorshipAmount || "5000"}</p>
                <p className="text-xs text-muted-foreground">Investment</p>
              </div>
              <div>
                <Calendar className="w-5 h-5 mx-auto mb-1 text-success" />
                <p className="text-lg font-bold">{formData.duration || "7"} days</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">YOUR BENEFITS</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Brand Visibility</Badge>
                <span className="text-xs text-muted-foreground">Logo on challenge page</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Impact Report</Badge>
                <span className="text-xs text-muted-foreground">Detailed analytics & metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Community Recognition</Badge>
                <span className="text-xs text-muted-foreground">Regional leaderboard boost</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Sponsor Challenge
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
