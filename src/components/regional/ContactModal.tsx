import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Loader2 } from "lucide-react";
import { z } from "zod";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  recipientUserId: string;
}

const getContactSchema = (t: (key: string) => string) => z.object({
  name: z.string().trim().min(1, t("contact.error_name_required")).max(100, t("contact.error_name_max")),
  email: z.string().trim().email(t("contact.error_email_invalid")).max(255, t("contact.error_email_max")),
  message: z.string().trim().min(10, t("contact.error_message_min")).max(1000, t("contact.error_message_max")),
});

export default function ContactModal({ open, onOpenChange, recipientName, recipientUserId }: ContactModalProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      getContactSchema(t).parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          senderName: formData.name,
          senderEmail: formData.email,
          recipientUserId,
          message: formData.message,
        },
      });

      if (error) throw error;

      toast({
        title: t("contact.success_title"),
        description: t("contact.success_description").replace("{name}", recipientName),
      });

      setFormData({ name: "", email: "", message: "" });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t("contact.error_title"),
        description: t("contact.error_description"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            {t("contact.modal_title")}: {recipientName}
          </DialogTitle>
          <DialogDescription>
            {t("contact.modal_description").replace("{name}", recipientName)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("contact.label_name")} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("contact.placeholder_name")}
              maxLength={100}
              disabled={loading}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("contact.label_email")} *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder={t("contact.placeholder_email")}
              maxLength={255}
              disabled={loading}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t("contact.label_message")} *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={t("contact.placeholder_message")}
              rows={6}
              maxLength={1000}
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.message && <p className="text-destructive">{errors.message}</p>}
              <p className={!errors.message ? "ml-auto" : ""}>{formData.message.length}/1000</p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("contact.button_cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("contact.button_send")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
