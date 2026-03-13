import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Users,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface ExpertApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpertApplicationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ExpertApplicationModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  // Form state
  const [motivation, setMotivation] = useState("");
  const [expertiseArea, setExpertiseArea] = useState("");
  const [experience, setExperience] = useState("");
  const [legalStatus, setLegalStatus] = useState<"individual" | "entrepreneur">("individual");

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Update profile with expert application data
      const { error } = await supabase
        .from("profiles")
        .update({
          verification_status: "pending",
          user_role: "expert",
          creator_legal_status: legalStatus,
          bio: motivation || (profile as any)?.bio || null,
          expert_title: expertiseArea || (profile as any)?.expert_title || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Create a notification for admins (insert into notifications table if it exists)
      try {
        await supabase.from("notifications").insert({
          user_id: user.id,
          type: "expert_application",
          title: language === "hu" ? "Új szakértő jelentkezés" : "New Expert Application",
          message: `${(profile as any)?.first_name || "Felhasználó"} ${(profile as any)?.last_name || ""} szakértőnek jelentkezett. Szakterület: ${expertiseArea}. Motiváció: ${motivation}`,
          link: "/admin/experts",
        });
      } catch {
        // notifications table might not exist yet — that's OK
      }

      setIsComplete(true);
    } catch (error) {
      toast({
        title: language === "hu" ? "Hiba" : "Error",
        description:
          language === "hu"
            ? "Nem sikerült elküldeni a jelentkezést. Próbáld újra."
            : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 3;

  if (isComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white border-[#e8e0d8] max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-[#3d3429] mb-2">
              {language === "hu" ? "Jelentkezés elküldve!" : "Application Submitted!"}
            </h3>
            <p className="text-[#3d3429]/60 mb-6">
              {language === "hu"
                ? "A csapatunk hamarosan átnézi a jelentkezésedet és értesítünk az eredményről. Ez általában 1-3 munkanapot vesz igénybe."
                : "Our team will review your application shortly. You'll be notified of the result, typically within 1-3 business days."}
            </p>
            <Button
              onClick={() => {
                onClose();
                onSuccess?.();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {language === "hu" ? "Rendben" : "Got it"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-[#e8e0d8] max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#3d3429]">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {language === "hu" ? "Szakértővé válok" : "Become an Expert"}
          </DialogTitle>
          <DialogDescription className="text-[#3d3429]/60">
            {language === "hu"
              ? `${step}. lépés a ${totalSteps}-ból — Töltsd ki az alábbi kérdőívet a jelentkezéshez.`
              : `Step ${step} of ${totalSteps} — Fill out the questionnaire to apply.`}
          </DialogDescription>
          {/* Progress bar */}
          <div className="flex gap-2 pt-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-orange-500" : "bg-[#e8e0d8]"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="py-4 min-h-[200px]">
          {/* Step 1: Motivation */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3d3429]">
                    {language === "hu" ? "Miért szeretnél szakértő lenni?" : "Why do you want to become an expert?"}
                  </h3>
                  <p className="text-sm text-[#3d3429]/60">
                    {language === "hu"
                      ? "Mesélj magadról — mi motivál, milyen tudást szeretnél megosztani?"
                      : "Tell us about yourself — what motivates you, what knowledge do you want to share?"}
                  </p>
                </div>
              </div>
              <Textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder={
                  language === "hu"
                    ? "Pl.: Szenvedélyem a kézművesség és 10 éve tanítok gyerekeknek..."
                    : "E.g.: I'm passionate about crafts and have been teaching children for 10 years..."
                }
                className="min-h-[120px] bg-[#f5f0eb] border-[#e8e0d8] focus:border-amber-400"
              />
            </div>
          )}

          {/* Step 2: Expertise */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3d3429]">
                    {language === "hu" ? "Szakterületed" : "Your Expertise"}
                  </h3>
                  <p className="text-sm text-[#3d3429]/60">
                    {language === "hu"
                      ? "Milyen területen szeretnél tartalmakat készíteni?"
                      : "What area would you like to create content in?"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[#3d3429]">
                  {language === "hu" ? "Szakértői megnevezés" : "Expert Title"}
                </Label>
                <Input
                  value={expertiseArea}
                  onChange={(e) => setExpertiseArea(e.target.value)}
                  placeholder={
                    language === "hu"
                      ? "Pl.: Kézműves workshop vezető, Wellness tanácsadó..."
                      : "E.g.: Craft Workshop Leader, Wellness Advisor..."
                  }
                  className="bg-[#f5f0eb] border-[#e8e0d8] focus:border-amber-400"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[#3d3429]">
                  {language === "hu" ? "Tapasztalat" : "Experience"}
                </Label>
                <Textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder={
                    language === "hu"
                      ? "Releváns tapasztalataid, végzettséged, referenciáid..."
                      : "Your relevant experience, qualifications, references..."
                  }
                  className="min-h-[100px] bg-[#f5f0eb] border-[#e8e0d8] focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Step 3: Legal status */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Users className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#3d3429]">
                    {language === "hu" ? "Jogi státusz" : "Legal Status"}
                  </h3>
                  <p className="text-sm text-[#3d3429]/60">
                    {language === "hu"
                      ? "Ez meghatározza, hogy ki állítja ki a számlát a vásárlónak."
                      : "This determines who issues invoices to buyers."}
                  </p>
                </div>
              </div>

              <RadioGroup
                value={legalStatus}
                onValueChange={(v) => setLegalStatus(v as "individual" | "entrepreneur")}
                className="space-y-3"
              >
                <div className="p-4 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8] hover:border-amber-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="individual" id="app_individual" className="mt-1 border-amber-400" />
                    <Label htmlFor="app_individual" className="cursor-pointer flex-1">
                      <span className="font-semibold text-[#3d3429]">
                        {language === "hu" ? "Magánszemély" : "Individual"}
                      </span>
                      <p className="text-sm text-[#3d3429]/60 mt-1">
                        {language === "hu"
                          ? "Nem vállalkozó \u2014 a Platform állítja ki a számlát a vásárlónak. A bevételed \u201Eegyéb jövedelem\u201D \u2014 Te adózol utána."
                          : "Not a business — the Platform issues invoices. Your income is 'other income' — you handle taxes."}
                      </p>
                    </Label>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#f5f0eb] border border-[#e8e0d8] hover:border-amber-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value="entrepreneur" id="app_entrepreneur" className="mt-1 border-amber-400" />
                    <Label htmlFor="app_entrepreneur" className="cursor-pointer flex-1">
                      <span className="font-semibold text-[#3d3429]">
                        {language === "hu" ? "Egyéni vállalkozó / Cég" : "Entrepreneur / Company"}
                      </span>
                      <p className="text-sm text-[#3d3429]/60 mt-1">
                        {language === "hu"
                          ? "Te állítod ki a számlát a vásárlónak. A Platform a közvetítői díjról (20%) állít számlát Neked."
                          : "You issue invoices to buyers. The Platform invoices you for the commission fee (20%)."}
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {/* Summary card */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-amber-800">
                  {language === "hu" ? (
                    <>
                      <strong>Bevételmegosztás:</strong> Te kapod a bevétel 80%-át, a Platform 20%-ot von le jutalékként.
                      A jóváhagyás után beállíthatod a Stripe Connect kifizetési fiókodat.
                    </>
                  ) : (
                    <>
                      <strong>Revenue split:</strong> You receive 80% of revenue, the Platform takes 20%.
                      After approval, you can set up your Stripe Connect payout account.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={isSubmitting}
                className="border-[#e8e0d8] text-[#3d3429] hover:bg-[#f5f0eb]"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {language === "hu" ? "Vissza" : "Back"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-[#e8e0d8] text-[#3d3429] hover:bg-[#f5f0eb]"
            >
              {language === "hu" ? "Mégse" : "Cancel"}
            </Button>
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !motivation.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {language === "hu" ? "Tovább" : "Next"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !motivation.trim() || !expertiseArea.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === "hu" ? "Küldés..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {language === "hu" ? "Jelentkezem" : "Apply"}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpertApplicationModal;
