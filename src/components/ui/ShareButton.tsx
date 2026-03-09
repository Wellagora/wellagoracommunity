import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Share2, Copy, Check, MessageCircle, Facebook, Link2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: "icon" | "full";
  size?: "sm" | "default";
}

export const ShareButton = memo(({
  url,
  title,
  description = "",
  className = "",
  variant = "icon",
  size = "sm",
}: ShareButtonProps) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

  const shareText = description
    ? `${title}\n\n${description}\n\n${fullUrl}`
    : `${title}\n\n${fullUrl}`;

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description || title, url: fullUrl });
        return;
      } catch {
        // User cancelled — fall through
      }
    }
  }, [title, description, fullUrl]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success(
        language === "hu" ? "Link másolva!" : language === "de" ? "Link kopiert!" : "Link copied!"
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [fullUrl, language]);

  const handleWhatsApp = useCallback(() => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [shareText]);

  const handleFacebook = useCallback(() => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  }, [fullUrl]);

  const shareLabel = language === "hu" ? "Megosztás" : language === "de" ? "Teilen" : "Share";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "icon" : "default"}
          className={`${variant === "icon" ? "h-8 w-8 rounded-full" : "gap-2"} ${className}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Share2 className={size === "sm" ? "w-4 h-4" : "w-5 h-5"} />
          {variant === "full" && <span>{shareLabel}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        {typeof navigator.share === "function" && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-3 cursor-pointer">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>{shareLabel}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleFacebook} className="gap-3 cursor-pointer">
          <Facebook className="w-4 h-4 text-[#1877F2]" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsApp} className="gap-3 cursor-pointer">
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy} className="gap-3 cursor-pointer">
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Link2 className="w-4 h-4 text-muted-foreground" />
          )}
          <span>{language === "hu" ? "Link másolása" : language === "de" ? "Link kopieren" : "Copy link"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ShareButton.displayName = "ShareButton";

export default ShareButton;
