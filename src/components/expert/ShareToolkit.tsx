import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Check,
  Share2,
  Download,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  QrCode,
  Image as ImageIcon,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface ShareToolkitProps {
  type: "profile" | "program";
  profileUrl?: string;
  programUrl?: string;
  expertName: string;
  programTitle?: string;
  programDate?: string;
  programPrice?: string;
  programLocation?: string;
  imageUrl?: string;
  onClose?: () => void;
  open?: boolean;
  celebrationMode?: boolean;
}

export function ShareToolkit({
  type,
  profileUrl,
  programUrl,
  expertName,
  programTitle,
  programDate,
  programPrice,
  programLocation,
  imageUrl,
  onClose,
  open = true,
  celebrationMode = false,
}: ShareToolkitProps) {
  const { t } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const url = type === "profile" ? profileUrl : programUrl;
  if (!url) return null;

  // --- UTM helpers ---
  const withUtm = (source: string) => {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}utm_source=${source}&utm_medium=share&utm_campaign=expert_${type}`;
  };

  // --- A) Copy link ---
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(withUtm("direct"));
      setCopiedLink(true);
      toast.success(t("share.link_copied"));
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  // --- B) Social share buttons ---
  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(withUtm("facebook"))}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleWhatsApp = () => {
    const text =
      type === "profile"
        ? t("share.whatsapp_profile", { name: expertName, url: withUtm("whatsapp") })
        : t("share.whatsapp_program", { title: programTitle || "", date: programDate || "", url: withUtm("whatsapp") });
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(withUtm("linkedin"))}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleEmail = () => {
    const subject =
      type === "profile"
        ? t("share.email_subject_profile", { name: expertName })
        : t("share.email_subject_program", { title: programTitle || "" });
    const body =
      type === "profile"
        ? t("share.email_body_profile", { name: expertName, url: withUtm("email") })
        : t("share.email_body_program", {
            title: programTitle || "",
            date: programDate || "",
            price: programPrice || "",
            url: withUtm("email"),
          });
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title:
          type === "profile"
            ? `${expertName} — WellAgora`
            : `${programTitle} — WellAgora`,
        text:
          type === "profile"
            ? t("share.whatsapp_profile", { name: expertName, url: "" })
            : t("share.whatsapp_program", { title: programTitle || "", date: programDate || "", url: "" }),
        url: withUtm("native"),
      });
    } catch {
      // User cancelled
    }
  };

  // --- C) Pre-written texts ---
  const facebookPost =
    type === "program" && programTitle
      ? t("share.prewritten_facebook_program", { title: programTitle, url: withUtm("facebook") })
      : t("share.prewritten_facebook_profile", { url: withUtm("facebook") });

  const whatsappMessage =
    type === "program" && programTitle
      ? t("share.prewritten_whatsapp_program", {
          title: programTitle,
          date: programDate || "",
          location: programLocation || "",
          url: withUtm("whatsapp"),
        })
      : t("share.prewritten_whatsapp_profile", { name: expertName, url: withUtm("whatsapp") });

  const emailTemplate =
    type === "program" && programTitle
      ? t("share.prewritten_email_program", {
          title: programTitle,
          date: programDate || "",
          location: programLocation || "",
          price: programPrice || "",
          url: withUtm("email"),
          name: expertName,
        })
      : t("share.prewritten_email_profile", { name: expertName, url: withUtm("email") });

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(key);
      toast.success(t("share.text_copied"));
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  // --- D) QR Code ---
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(withUtm("qr"))}`;

  const downloadQR = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `wellagora-qr-${type === "profile" ? "profil" : (programTitle || "program")}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      toast.error("Download failed");
    }
  };

  // --- E) Social Card (Canvas-based) ---
  const generateShareImage = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#2C5530";
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative circle
    ctx.beginPath();
    ctx.arc(1100, 100, 200, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(198,123,78,0.15)";
    ctx.fill();

    // WellAgora logo text
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillStyle = "#C67B4E";
    ctx.fillText("WellAgora", 60, 60);

    // Leaf emoji
    ctx.font = "40px serif";
    ctx.fillText("🌿", 1100, 65);

    // Profile image (circle)
    if (imageUrl) {
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = imageUrl;
        });
        // Draw circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(140, 220, 70, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 70, 150, 140, 140);
        ctx.restore();

        // Circle border
        ctx.beginPath();
        ctx.arc(140, 220, 72, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 3;
        ctx.stroke();
      } catch {
        // Skip image if it fails to load
      }
    }

    // Expert name
    ctx.font = "bold 36px system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    const nameX = imageUrl ? 240 : 60;
    ctx.fillText(expertName, nameX, 210);

    // Program info
    let yOffset = 300;
    if (type === "program" && programTitle) {
      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.fillStyle = "#C67B4E";
      ctx.fillText(programTitle, 60, yOffset);
      yOffset += 50;

      if (programDate || programLocation) {
        ctx.font = "24px system-ui, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        const meta = [programDate ? `📅 ${programDate}` : "", programLocation ? `📍 ${programLocation}` : ""]
          .filter(Boolean)
          .join("  ");
        ctx.fillText(meta, 60, yOffset);
        yOffset += 50;
      }
    }

    // URL
    ctx.font = "20px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    const displayUrl = url.replace(/^https?:\/\//, "");
    ctx.fillText(displayUrl, 60, 560);

    // QR code on the right
    try {
      const qrImg = new window.Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => resolve();
        qrImg.onerror = () => reject();
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=FFFFFF&bgcolor=2C5530&data=${encodeURIComponent(withUtm("social_card"))}`;
      });
      ctx.drawImage(qrImg, 980, 430, 150, 150);
    } catch {
      // Skip QR if it fails
    }

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `wellagora-${expertName.toLowerCase().replace(/\s+/g, "-")}-share.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    }, "image/png");
  };

  const content = (
    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
      {/* Celebration banner */}
      {celebrationMode && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-lg font-semibold text-emerald-800">
            {t("share.published_share_prompt")}
          </p>
        </div>
      )}

      {/* A) Direct Link */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          {t("share.copy_link")}
        </h4>
        <div className="flex gap-2">
          <Input value={url} readOnly className="text-xs font-mono bg-muted/50" />
          <Button variant="outline" size="icon" onClick={handleCopyLink} className="flex-shrink-0">
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* B) Social Share Buttons */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          {t("share.social_buttons") || "Share"}
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleFacebook} className="gap-2 hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30">
            <Facebook className="w-4 h-4" />
            Facebook
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-2 hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={handleLinkedIn} className="gap-2 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/30">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmail} className="gap-2 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30">
            <Mail className="w-4 h-4" />
            E-mail
          </Button>
          {typeof navigator !== "undefined" && navigator.share && (
            <Button variant="outline" size="sm" onClick={handleNativeShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              {t("share.native_share") || "Share"}
            </Button>
          )}
        </div>
      </div>

      {/* C) Pre-written Texts */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          {t("share.prewritten_texts") || "Ready-to-use texts"}
        </h4>

        {/* Facebook post */}
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs gap-1">
                <Facebook className="w-3 h-3" />
                {t("share.facebook_post")}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => handleCopyText("fb", facebookPost)} className="h-7 text-xs gap-1">
                {copiedText === "fb" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {t("share.copy_text")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground whitespace-pre-line">{facebookPost}</p>
          </CardContent>
        </Card>

        {/* WhatsApp message */}
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs gap-1">
                <MessageCircle className="w-3 h-3" />
                {t("share.whatsapp_message")}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => handleCopyText("wa", whatsappMessage)} className="h-7 text-xs gap-1">
                {copiedText === "wa" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {t("share.copy_text")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground whitespace-pre-line">{whatsappMessage}</p>
          </CardContent>
        </Card>

        {/* Email template */}
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs gap-1">
                <Mail className="w-3 h-3" />
                {t("share.email_template")}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => handleCopyText("email", emailTemplate)} className="h-7 text-xs gap-1">
                {copiedText === "email" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {t("share.copy_text")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground whitespace-pre-line">{emailTemplate}</p>
          </CardContent>
        </Card>
      </div>

      {/* D) QR Code */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <QrCode className="w-4 h-4" />
          QR
        </h4>
        <div className="flex items-start gap-4">
          <img
            src={qrUrl}
            alt="QR Code"
            className="w-[150px] h-[150px] rounded-lg border bg-white p-2"
          />
          <div className="flex-1 space-y-2">
            <Button variant="outline" size="sm" onClick={downloadQR} className="gap-2">
              <Download className="w-4 h-4" />
              {t("share.download_qr")}
            </Button>
            <p className="text-xs text-muted-foreground">{t("share.qr_description")}</p>
          </div>
        </div>
      </div>

      {/* E) Social Card */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {t("share.social_card_title")}
        </h4>
        {/* Preview */}
        <div
          className="w-full aspect-[1200/630] rounded-lg overflow-hidden mb-2 relative"
          style={{ background: "#2C5530" }}
        >
          <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold" style={{ color: "#C67B4E" }}>
                WellAgora
              </span>
              <span className="text-lg">🌿</span>
            </div>
            <div>
              <p className="font-bold text-lg">{expertName}</p>
              {type === "program" && programTitle && (
                <p className="text-sm mt-1" style={{ color: "#C67B4E" }}>
                  {programTitle}
                </p>
              )}
              {(programDate || programLocation) && (
                <p className="text-xs opacity-70 mt-1">
                  {programDate && `📅 ${programDate}`}
                  {programDate && programLocation && "  "}
                  {programLocation && `📍 ${programLocation}`}
                </p>
              )}
            </div>
            <p className="text-[10px] opacity-50">
              {url.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={generateShareImage} className="gap-2">
          <Download className="w-4 h-4" />
          {t("share.download_image")}
        </Button>
      </div>
    </div>
  );

  // Render as Dialog
  if (onClose) {
    return (
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              {type === "profile" ? t("share.share_profile") : t("share.share_program")}
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Render inline
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          {type === "profile" ? t("share.share_profile") : t("share.share_program")}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default ShareToolkit;
