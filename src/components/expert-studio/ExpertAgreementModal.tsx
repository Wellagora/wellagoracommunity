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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, FileCheck, Shield, Scale } from "lucide-react";

/** Current version of the Expert Agreement (ÁSZF) */
export const EXPERT_ASZF_VERSION = "1.0.0";

interface ExpertAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccepted: () => void;
  /** Creator legal status affects agreement content */
  creatorLegalStatus?: "individual" | "entrepreneur";
}

export const ExpertAgreementModal = ({
  isOpen,
  onClose,
  onAccepted,
  creatorLegalStatus = "individual",
}: ExpertAgreementModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDataProcessing, setAgreedToDataProcessing] = useState(false);
  const [agreedToPayoutTerms, setAgreedToPayoutTerms] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();

  const allAgreed = agreedToTerms && agreedToDataProcessing && agreedToPayoutTerms;

  const handleAccept = async () => {
    if (!user || !allAgreed) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          expert_aszf_accepted_at: new Date().toISOString(),
          expert_aszf_version: EXPERT_ASZF_VERSION,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: language === "hu" ? "Szerződés elfogadva" : "Agreement Accepted",
        description:
          language === "hu"
            ? "Az Általános Szakértői Szerződési Feltételek elfogadásra kerültek."
            : "The Expert Service Agreement has been accepted.",
      });

      onAccepted();
    } catch (error) {
      toast({
        title: language === "hu" ? "Hiba" : "Error",
        description:
          language === "hu"
            ? "Nem sikerült elfogadni a szerződést. Próbáld újra."
            : "Failed to accept the agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-[#e8e0d8] max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#3d3429]">
            <Scale className="w-5 h-5 text-amber-500" />
            {language === "hu"
              ? "Szakértői Szolgáltatási Szerződés (ÁSZF)"
              : "Expert Service Agreement"}
          </DialogTitle>
          <DialogDescription className="text-[#3d3429]/60">
            {language === "hu"
              ? `Verzió: ${EXPERT_ASZF_VERSION} — A tartalom értékesítés megkezdéséhez el kell fogadnod az alábbi feltételeket.`
              : `Version: ${EXPERT_ASZF_VERSION} — Please accept the following terms to start selling content.`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6 text-sm text-[#3d3429]/80 leading-relaxed">
            {/* Section 1: Platform relationship */}
            <section>
              <h3 className="font-semibold text-[#3d3429] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                {language === "hu" ? "A Platform és a Szakértő közötti jogviszony" : "Platform-Expert Relationship"}
              </h3>
              <p>
                {language === "hu"
                  ? `A WellAgora platform (üzemeltető: ProSelf International Zrt.) közvetítőként működik a Szakértő és a Vásárló között. A Platform nem munkáltató, nem megbízó — a Szakértő önálló felelőssége a tartalom minősége, jogszerűsége és az adókötelezettségeinek teljesítése.`
                  : `The WellAgora platform (operated by ProSelf International Zrt.) acts as an intermediary between the Expert and the Buyer. The Platform is not an employer — the Expert is independently responsible for content quality, legality, and tax obligations.`}
              </p>
            </section>

            {/* Section 2: Revenue split */}
            <section>
              <h3 className="font-semibold text-[#3d3429] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                {language === "hu" ? "Bevételmegosztás és jutalék" : "Revenue Split and Fees"}
              </h3>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <p>
                  {language === "hu"
                    ? `A Platform 20% jutalékot von le minden tranzakcióból. A Szakértő a fennmaradó 80%-ot kapja meg. Founding Expert esetén a jutalék 0%.`
                    : `The Platform deducts a 20% commission from every transaction. The Expert receives the remaining 80%. Founding Experts receive 0% commission.`}
                </p>
              </div>
            </section>

            {/* Section 3: Invoicing */}
            <section>
              <h3 className="font-semibold text-[#3d3429] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                {language === "hu" ? "Számlázás" : "Invoicing"}
              </h3>
              {creatorLegalStatus === "individual" ? (
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p>
                    {language === "hu"
                      ? `Magánszemély szakértőként a Platform állítja ki a számlát a Vásárló felé a Számlázz.hu rendszeren keresztül. A bevételed „egyéb jövedelem"-nek minősül — az adóbevallásodban Te köteles vagy feltüntetni.`
                      : `As an individual expert, the Platform issues invoices to the Buyer via Számlázz.hu. Your income qualifies as "other income" — you are responsible for reporting it in your tax return.`}
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <p>
                    {language === "hu"
                      ? `Vállalkozó szakértőként Te állítod ki a számlát a Vásárló felé. A Platform a jutalékról állít ki számlát Neked. A NAV Online Számla kompatibilitás a Te felelősséged.`
                      : `As an entrepreneur expert, you issue invoices to the Buyer. The Platform invoices you for the commission fee. NAV Online Számla compliance is your responsibility.`}
                  </p>
                </div>
              )}
            </section>

            {/* Section 4: Payouts */}
            <section>
              <h3 className="font-semibold text-[#3d3429] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                  4
                </span>
                {language === "hu" ? "Kifizetések" : "Payouts"}
              </h3>
              <p>
                {language === "hu"
                  ? `A kifizetés a Stripe Connect rendszeren keresztül történik az általad megadott bankszámlára. A kifizetés a sikeres tranzakciót követő 7-14 munkanapon belül érkezik. A Platform nem felelős a Stripe által okozott késedelmekért.`
                  : `Payouts are processed via Stripe Connect to your designated bank account. Payouts arrive within 7-14 business days after a successful transaction. The Platform is not responsible for delays caused by Stripe.`}
              </p>
            </section>

            {/* Section 5: Withdrawal / Refund */}
            <section>
              <h3 className="font-semibold text-[#3d3429] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                  5
                </span>
                {language === "hu" ? "Visszatérítési politika" : "Refund Policy"}
              </h3>
              <p>
                {language === "hu"
                  ? `A Vásárlónak az EU 2011/83/EU irányelv (magyar 45/2014. Korm. rendelet) alapján 14 napos elállási joga van, amely időszakban a Stripe-on keresztül teljes visszatérítésre jogosult. A Vásárló a checkout során explicit hozzájárulást ad a digitális tartalom azonnali hozzáférésére, de ez nem zárja ki a 14 napos visszatérítési jogot. 14 nap után platform kredit formájában lehetséges visszatérítés.`
                  : `Buyers have a 14-day withdrawal right under EU Directive 2011/83/EU. During this period, they are entitled to a full Stripe refund. After 14 days, refunds are available as platform credit.`}
              </p>
            </section>

            {/* Section 6: DAC7 */}
            <section>
              <h3 className="font-semibold text-[#3d3429] mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center justify-center font-bold">
                  6
                </span>
                {language === "hu" ? "Adatszolgáltatási kötelezettség (DAC7)" : "Reporting Obligations (DAC7)"}
              </h3>
              <p>
                {language === "hu"
                  ? `Az EU DAC7 irányelv alapján a Platform köteles évente jelenteni a NAV felé minden magánszemély szakértőnek kifizetett összeget. Ehhez szükséges az adóazonosító jeled és a születési dátumod megadása a profilodban.`
                  : `Under the EU DAC7 directive, the Platform is required to report all payments to individual experts to the tax authority (NAV) annually. This requires your tax ID and date of birth in your profile.`}
              </p>
            </section>
          </div>
        </ScrollArea>

        {/* Consent checkboxes */}
        <div className="space-y-3 pt-4 border-t border-[#e8e0d8]">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-terms"
              checked={agreedToTerms}
              onCheckedChange={(c) => setAgreedToTerms(c === true)}
              className="mt-0.5 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <label htmlFor="agree-terms" className="text-sm text-[#3d3429]/80 cursor-pointer">
              {language === "hu"
                ? "Elfogadom a Szakértői Szolgáltatási Szerződés (ÁSZF) feltételeit."
                : "I accept the Expert Service Agreement terms."}
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-data"
              checked={agreedToDataProcessing}
              onCheckedChange={(c) => setAgreedToDataProcessing(c === true)}
              className="mt-0.5 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <label htmlFor="agree-data" className="text-sm text-[#3d3429]/80 cursor-pointer">
              {language === "hu"
                ? "Hozzájárulok az adataim kezeléséhez a DAC7 és NAV adatszolgáltatás céljából."
                : "I consent to data processing for DAC7 and tax reporting purposes."}
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-payout"
              checked={agreedToPayoutTerms}
              onCheckedChange={(c) => setAgreedToPayoutTerms(c === true)}
              className="mt-0.5 border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <label htmlFor="agree-payout" className="text-sm text-[#3d3429]/80 cursor-pointer">
              {language === "hu"
                ? "Elfogadom a 80/20%-os bevételmegosztást és a Stripe Connect kifizetési feltételeket."
                : "I accept the 80/20% revenue split and Stripe Connect payout terms."}
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-[#e8e0d8] text-[#3d3429] hover:bg-[#f5f0eb]"
          >
            {language === "hu" ? "Mégse" : "Cancel"}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isSubmitting || !allAgreed}
            className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === "hu" ? "Feldolgozás..." : "Processing..."}
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4 mr-2" />
                {language === "hu" ? "Elfogadom a szerződést" : "Accept Agreement"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExpertAgreementModal;
