import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from 'sonner';
import { MessageSquare, Trash2, Edit2 } from "lucide-react";
import { awardPoints, WELLPOINTS_QUERY_KEY } from '@/lib/wellpoints';
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";
import { formatDistanceToNow } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";

interface ReviewSectionProps {
  contentId: string;
}

interface Review {
  id: string;
  user_id: string;
  content_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

const ReviewSection = ({ contentId }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const dateLocales = { hu, en: enUS, de };

  // Check if user has access
  const { data: hasAccess } = useQuery({
    queryKey: ["userAccess", contentId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("content_access")
        .select("id")
        .eq("content_id", contentId)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // Fetch reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["contentReviews", contentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_reviews")
        .select(`
          *,
          user:profiles!content_reviews_user_id_fkey (
            id, first_name, last_name, avatar_url
          )
        `)
        .eq("content_id", contentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
  });

  // Fetch average rating
  const { data: avgRating } = useQuery({
    queryKey: ["contentAvgRating", contentId],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_content_average_rating", {
        p_content_id: contentId,
      });
      return data as number;
    },
  });

  // Check if user already reviewed
  const userReview = reviews?.find((r) => r.user_id === user?.id);

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      if (editingReviewId) {
        const { error } = await supabase
          .from("content_reviews")
          .update({
            rating,
            comment: comment || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingReviewId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("content_reviews").insert({
          user_id: user.id,
          content_id: contentId,
          rating,
          comment: comment || null,
        }).select().single();
        if (error) throw error;
        
        // Award points for submitting review
        if (data) {
          await awardPoints(user.id, 'review_submitted', 'Értékelés beküldve', data.id, 'review');
          queryClient.invalidateQueries({ queryKey: WELLPOINTS_QUERY_KEY(user.id) });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentReviews", contentId] });
      queryClient.invalidateQueries({ queryKey: ["contentAvgRating", contentId] });
      
      if (editingReviewId) {
        toast({
          title: t("reviews.updated"),
        });
      } else {
        sonnerToast.success('+20 WellPont! 🪙', { description: 'Köszönjük az értékelést!' });
      }
      
      setRating(0);
      setComment("");
      setIsEditing(false);
      setEditingReviewId(null);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    },
  });

  // Delete review mutation
  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("content_reviews")
        .delete()
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentReviews", contentId] });
      queryClient.invalidateQueries({ queryKey: ["contentAvgRating", contentId] });
      toast({ title: t("reviews.deleted") });
    },
  });

  const handleEdit = (review: Review) => {
    setRating(review.rating);
    setComment(review.comment || "");
    setIsEditing(true);
    setEditingReviewId(review.id);
  };

  const handleCancelEdit = () => {
    setRating(0);
    setComment("");
    setIsEditing(false);
    setEditingReviewId(null);
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-[hsl(var(--cyan))]" />
        {t("reviews.title")}
      </h2>

      {/* Average Rating Summary */}
      {reviews && reviews.length > 0 && (
        <div className="bg-[#112240]/50 rounded-xl p-6 mb-8 flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground mb-1">
              {avgRating?.toFixed(1) || "0"}
            </div>
            <StarRating rating={Math.round(avgRating || 0)} size="md" />
          </div>
          <div className="text-muted-foreground">
            {reviews.length} {t("reviews.count")}
          </div>
        </div>
      )}

      {/* Review Form */}
      {user && hasAccess && (!userReview || isEditing) && (
        <Card className="bg-[#112240] border-[hsl(var(--cyan))]/20 mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {isEditing ? t("reviews.edit") : t("reviews.write")}
            </h3>

            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-2">
                {t("reviews.your_rating")}
              </label>
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
            </div>

            <div className="mb-4">
              <label className="text-sm text-muted-foreground block mb-2">
                {t("reviews.your_comment")}
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("reviews.comment_placeholder")}
                className="bg-[#0A1930] border-[hsl(var(--cyan))]/20 focus:border-[hsl(var(--cyan))] min-h-[100px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => submitReview.mutate()}
                disabled={rating === 0 || submitReview.isPending}
                className="bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--primary))] hover:opacity-90"
              >
                {submitReview.isPending
                  ? t("common.loading")
                  : isEditing
                  ? t("reviews.update")
                  : t("reviews.submit")}
              </Button>
              {isEditing && (
                <Button variant="outline" onClick={handleCancelEdit}>
                  {t("common.cancel")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already reviewed message */}
      {user && hasAccess && userReview && !isEditing && (
        <div className="bg-[#112240]/30 rounded-lg p-4 mb-8 text-muted-foreground flex items-center justify-between">
          <span>{t("reviews.already_reviewed")}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(userReview)}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {t("reviews.edit")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300"
              onClick={() => deleteReview.mutate(userReview.id)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {t("reviews.delete")}
            </Button>
          </div>
        </div>
      )}

      {/* Must enroll message */}
      {user && !hasAccess && (
        <div className="bg-[#112240]/30 rounded-lg p-4 mb-8 text-muted-foreground">
          {t("reviews.must_enroll")}
        </div>
      )}

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <AnimatePresence>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#112240]/50 border-[hsl(var(--cyan))]/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10 border border-[hsl(var(--cyan))]/20">
                        <AvatarImage src={review.user?.avatar_url || undefined} />
                        <AvatarFallback className="bg-[hsl(var(--cyan))]/20 text-[hsl(var(--cyan))]">
                          {review.user?.first_name?.[0]}
                          {review.user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold text-foreground">
                              {review.user?.first_name} {review.user?.last_name}
                            </span>
                            <span className="text-muted-foreground text-sm ml-3">
                              {formatDistanceToNow(new Date(review.created_at), {
                                addSuffix: true,
                                locale: dateLocales[language as keyof typeof dateLocales] || enUS,
                              })}
                            </span>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{t("reviews.no_reviews")}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
