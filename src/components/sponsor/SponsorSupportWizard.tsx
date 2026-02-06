import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { SupportScopeType, Currency, CreateSupportRuleInput } from "@/types/sponsorSupport";

interface SponsorSupportWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function SponsorSupportWizard({ onComplete, onCancel }: SponsorSupportWizardProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [scopeType, setScopeType] = useState<SupportScopeType>("program");
  const [scopeId, setScopeId] = useState("");
  const [amountPerParticipant, setAmountPerParticipant] = useState("");
  const [currency, setCurrency] = useState<Currency>("HUF");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Fetch programs for scope selection
  const { data: programs, isLoading: loadingPrograms } = useQuery({
    queryKey: ["programs-for-support"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("id, title, price_eur, price_huf, currency")
        .eq("status", "published")
        .order("title");
      
      if (error) throw error;
      return data || [];
    },
    enabled: scopeType === "program",
  });

  // Get selected program details for validation
  const selectedProgram = programs?.find(p => p.id === scopeId);

  // Preset amounts based on currency
  const presetAmounts = currency === "HUF" 
    ? [1000, 2000, 5000, 10000]
    : [10, 20, 50, 100];

  const handleNext = () => {
    if (step === 1 && !scopeId) {
      toast({
        title: t("common.error"),
        description: t("sponsor_support.select_" + scopeType),
        variant: "destructive",
      });
      return;
    }

    if (step === 2) {
      const amount = parseFloat(amountPerParticipant);
      if (!amount || amount <= 0) {
        toast({
          title: t("common.error"),
          description: t("sponsor_support.amount_per_participant"),
          variant: "destructive",
        });
        return;
      }

      // Validate amount <= program price
      if (selectedProgram) {
        const programPrice = selectedProgram.currency === "EUR" 
          ? selectedProgram.price_eur 
          : selectedProgram.price_huf;
        
        if (amount > programPrice) {
          toast({
            title: t("common.error"),
            description: t("sponsor_support.max_80_percent"),
            variant: "destructive",
          });
          return;
        }

        // Set currency to match program
        if (selectedProgram.currency !== currency) {
          setCurrency(selectedProgram.currency as Currency);
        }
      }
    }

    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    const budget = parseFloat(budgetTotal);
    if (!budget || budget <= 0) {
      toast({
        title: t("common.error"),
        description: t("sponsor_support.budget_total"),
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsSubmitting(true);
    try {
      const ruleData: CreateSupportRuleInput = {
        scope_type: scopeType,
        scope_id: scopeId,
        amount_per_participant: parseFloat(amountPerParticipant),
        currency: selectedProgram?.currency as Currency || currency,
        budget_total: budget,
        max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
        start_at: startDate?.toISOString(),
        end_at: endDate?.toISOString(),
      };

      const { error } = await supabase
        .from("sponsor_support_rules")
        .insert({
          sponsor_id: user.id,
          ...ruleData,
        });

      if (error) throw error;

      toast({
        title: t("common.success"),
        description: t("sponsor_support.support_created"),
      });

      onComplete?.();
    } catch (error) {
      console.error("Error creating support rule:", error);
      toast({
        title: t("common.error"),
        description: t("sponsor_support.create_error"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("sponsor_support.wizard_title")}</CardTitle>
        <CardDescription>
          {step === 1 && t("sponsor_support.step_scope")}
          {step === 2 && t("sponsor_support.step_amount")}
          {step === 3 && t("sponsor_support.step_budget")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Scope Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("sponsor_support.step_scope")}</Label>
              <Select value={scopeType} onValueChange={(value) => {
                setScopeType(value as SupportScopeType);
                setScopeId("");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="program">{t("sponsor_support.scope_type_program")}</SelectItem>
                  <SelectItem value="category">{t("sponsor_support.scope_type_category")}</SelectItem>
                  <SelectItem value="creator">{t("sponsor_support.scope_type_creator")}</SelectItem>
                  <SelectItem value="event">{t("sponsor_support.scope_type_event")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scopeType === "program" && (
              <div className="space-y-2">
                <Label>{t("sponsor_support.select_program")}</Label>
                <Select value={scopeId} onValueChange={setScopeId} disabled={loadingPrograms}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("sponsor_support.select_program")} />
                  </SelectTrigger>
                  <SelectContent>
                    {programs?.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.title} ({program.currency === "EUR" ? `€${program.price_eur}` : `${program.price_huf} Ft`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Amount */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("sponsor_support.amount_per_participant")}</Label>
              <div className="text-sm text-muted-foreground mb-2">
                {t("sponsor_support.program_currency")}: {selectedProgram?.currency || currency}
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {presetAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={amountPerParticipant === amount.toString() ? "default" : "outline"}
                    onClick={() => setAmountPerParticipant(amount.toString())}
                  >
                    {currency === "HUF" ? `${amount} Ft` : `€${amount}`}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                value={amountPerParticipant}
                onChange={(e) => setAmountPerParticipant(e.target.value)}
                placeholder={t("sponsor_support.custom_amount")}
                min="0"
                step={currency === "HUF" ? "100" : "1"}
              />
              {selectedProgram && (
                <p className="text-sm text-muted-foreground">
                  {t("sponsor_support.max_80_percent")}: {
                    selectedProgram.currency === "EUR" 
                      ? `€${selectedProgram.price_eur}` 
                      : `${selectedProgram.price_huf} Ft`
                  }
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Budget & Dates */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("sponsor_support.budget_total")}</Label>
              <Input
                type="number"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
                placeholder="10000"
                min="0"
                step={currency === "HUF" ? "1000" : "10"}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("sponsor_support.max_participants")}</Label>
              <Input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="100"
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("sponsor_support.start_date")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : t("sponsor_support.start_date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{t("sponsor_support.end_date")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : t("sponsor_support.end_date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("sponsor_support.previous")}
            </Button>
          )}
          {step === 1 && onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("sponsor_support.cancel")}
            </Button>
          )}
        </div>

        <div>
          {step < 3 ? (
            <Button type="button" onClick={handleNext}>
              {t("sponsor_support.next")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              <Check className="mr-2 h-4 w-4" />
              {t("sponsor_support.create_support")}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
