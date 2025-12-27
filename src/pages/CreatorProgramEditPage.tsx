import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import ProgramEditor from "@/components/creator/ProgramEditor";

const CreatorProgramEditPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();

  // Route guard - redirect if not creator
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (profile && profile.user_role !== "creator") {
      toast.error(t("creator.creators_only"));
      navigate("/dashboard");
    }
  }, [user, profile, navigate, t]);

  // Prevent rendering if not creator or no id
  if (!user || !profile || profile.user_role !== "creator" || !id) {
    return null;
  }

  return <ProgramEditor mode="edit" programId={id} />;
};

export default CreatorProgramEditPage;