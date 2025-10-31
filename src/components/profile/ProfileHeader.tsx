import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2 } from "lucide-react";

interface ProfileHeaderProps {
  avatarUrl?: string;
  firstName: string;
  lastName: string;
  role: string;
  organization?: string;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  avatarUploading: boolean;
}

export const ProfileHeader = ({
  avatarUrl,
  firstName,
  lastName,
  role,
  organization,
  onAvatarUpload,
  avatarUploading
}: ProfileHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
      <div className="relative group">
        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/20">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-3xl bg-gradient-primary text-white">
            {firstName?.[0]}{lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <label 
          htmlFor="avatar-upload" 
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {avatarUploading ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Camera className="w-8 h-8 text-white" />
          )}
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={onAvatarUpload}
          className="hidden"
          disabled={avatarUploading}
        />
      </div>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{firstName} {lastName}</h1>
        {organization && (
          <p className="text-lg text-muted-foreground mb-2">{organization}</p>
        )}
        <p className="text-sm text-muted-foreground capitalize">{role}</p>
      </div>
    </div>
  );
};
