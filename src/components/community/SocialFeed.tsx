import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageCircle,
  Share2,
  HelpCircle,
  Lightbulb,
  Trophy,
  Sparkles,
  CheckCircle,
  Bookmark,
  ChevronRight,
  Gift,
  Building2,
  ImagePlus,
  LayoutGrid,
  Megaphone,
  Send,
  Reply,
} from "lucide-react";
import WellBotAvatar from "@/components/ai/WellBotAvatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
type PostType = 'expert_tip' | 'question' | 'success_story' | 'announcement' | 'wellbot_answer';

interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'member' | 'expert' | 'wellbot';
  authorBadge?: string;
  content: string;
  createdAt: string;
  isExpertAnswer?: boolean;
}

interface FeedPost {
  id: string;
  type: PostType;
  authorId: string;
  authorName: string;
  authorRole: 'member' | 'expert' | 'sponsor' | 'wellbot';
  authorBadge?: string;
  content: string;
  imageUrl?: string;
  programKeywords?: string[];
  relatedProgramId?: string;
  createdAt: string;
  likes: number;
  isLikedByMe: boolean;
  comments: FeedComment[];
  isWellBotResponse?: boolean;
  replyToPostId?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const postVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const SocialFeed = () => {
  const { isDemoMode, user } = useAuth();
  const { t, language } = useLanguage();
  const { stats } = useCommunityStats();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // No community_posts table yet — start with empty feed
    setPosts([]);
  }, []);

  const filteredPosts =
    filter === "all"
      ? posts
      : filter === "question"
      ? posts.filter(
          (p) =>
            p.type === "question" ||
            (p.type === "wellbot_answer" && p.replyToPostId)
        )
      : posts.filter((p) => p.type === filter);

  // Optimistic like handler
  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLikedByMe ? post.likes - 1 : post.likes + 1,
              isLikedByMe: !post.isLikedByMe,
            }
          : post
      )
    );
  };

  const handleShare = (postId: string) => {
    toast.success(t("feed.share_copied") || "Link másolva!");
  };

  const getUserInitials = () => {
    if (!user) return "?";
    const name = (user as any).first_name || user.email || "";
    return name.charAt(0).toUpperCase();
  };

  // Time ago formatter
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t("feed.just_now");
    if (diffMins < 60)
      return t("feed.mins_ago").replace("{{count}}", String(diffMins));
    if (diffHours < 24)
      return t("feed.hours_ago").replace("{{count}}", String(diffHours));
    return t("feed.days_ago").replace("{{count}}", String(diffDays));
  };

  const getInitials = (name: string): string => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feed Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {t("feed.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("feed.subtitle")
            .replace("{{members}}", String(stats.members))
            .replace("{{experts}}", String(stats.experts))}
        </p>
      </div>

      {/* Post Creator */}
      {user && (
        <Card className="mb-6 border border-border/50 hover:border-border transition-colors bg-card/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/20 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div
                onClick={() =>
                  toast.info(t("feed.coming_soon") || "Hamarosan elérhető!")
                }
                className="flex-1 bg-muted/50 hover:bg-muted rounded-full px-4 py-2.5 text-muted-foreground cursor-pointer transition-colors"
              >
                {t("feed.whats_on_your_mind")}
              </div>
              <Button variant="ghost" size="icon" className="text-emerald-600">
                <ImagePlus className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Tabs
        value={filter}
        onValueChange={setFilter}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="all" className="gap-1.5">
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">{t("feed.all")}</span>
          </TabsTrigger>
          <TabsTrigger value="question" className="gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t("feed.questions")}</span>
          </TabsTrigger>
          <TabsTrigger value="expert_tip" className="gap-1.5">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">{t("feed.tips")}</span>
          </TabsTrigger>
          <TabsTrigger value="success_story" className="gap-1.5">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">{t("feed.success")}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Posts List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredPosts.map((post, index) => (
            <motion.div key={post.id} variants={postVariants} layout>
              <PostCard
                post={post}
                onLike={handleLike}
                onShare={handleShare}
                formatTimeAgo={formatTimeAgo}
                getInitials={getInitials}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {t("community_building.community_title")}
          </h3>
          <p className="text-gray-500 max-w-md mb-6">
            {t("community_building.community_desc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {user ? (
              <Button onClick={() => toast.info(t("feed.coming_soon") || "Hamarosan elérhető!")}>
                {t("community_building.community_first_post")}
              </Button>
            ) : (
              <Button asChild>
                <a href="/register">{t("community_building.join_community")}</a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Post Type Badge Component
const PostTypeBadge = ({ type }: { type: FeedPost["type"] }) => {
  const { t } = useLanguage();

  const config: Record<
    FeedPost["type"],
    { icon: React.ComponentType<{ className?: string }>; label: string; className: string }
  > = {
    expert_tip: {
      icon: Lightbulb,
      label: t("feed.expert_tip"),
      className: "bg-amber-100 text-amber-700",
    },
    question: {
      icon: HelpCircle,
      label: t("feed.question"),
      className: "bg-blue-100 text-blue-700",
    },
    success_story: {
      icon: Trophy,
      label: t("feed.success_story"),
      className: "bg-green-100 text-green-700",
    },
    announcement: {
      icon: Megaphone,
      label: t("feed.announcement"),
      className: "bg-purple-100 text-purple-700",
    },
    wellbot_answer: {
      icon: Sparkles,
      label: t("feed.wellbot_suggestion"),
      className: "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700",
    },
  };

  const { icon: Icon, label, className } = config[type];

  return (
    <Badge className={cn("text-xs gap-1", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
};

// Related Program Card Component
const RelatedProgramCard = ({ programId }: { programId: string }) => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // No DB-backed program lookup yet
  return null;
};

// Comment Card Component
const CommentCard = ({
  comment,
  getInitials,
  formatTimeAgo,
}: {
  comment: FeedPost["comments"][0];
  getInitials: (name: string) => string;
  formatTimeAgo: (date: string) => string;
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "p-3 rounded-lg",
        comment.isExpertAnswer
          ? "bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
          : "bg-muted/50"
      )}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Avatar className="w-6 h-6">
          <AvatarFallback
            className={cn(
              "text-xs",
              comment.isExpertAnswer && "bg-emerald-200 text-emerald-700"
            )}
          >
            {getInitials(comment.authorName)}
          </AvatarFallback>
        </Avatar>

        <span className="font-medium text-sm">{comment.authorName}</span>

        {comment.isExpertAnswer && (
          <Badge className="bg-emerald-600 text-white text-xs gap-1">
            <CheckCircle className="w-3 h-3" />
            {t("feed.expert_answer")}
          </Badge>
        )}

        <span className="text-xs text-muted-foreground ml-auto">
          {formatTimeAgo(comment.createdAt)}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{comment.content}</p>
    </div>
  );
};

// Comments Section Component
const CommentsSection = ({
  comments,
  getInitials,
  formatTimeAgo,
}: {
  comments: FeedPost["comments"];
  getInitials: (name: string) => string;
  formatTimeAgo: (date: string) => string;
}) => {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const displayedComments = showAll ? comments : comments.slice(0, 2);
  const hasMore = comments.length > 2;

  return (
    <div className="mt-4 pt-4 border-t space-y-3">
      {displayedComments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          getInitials={getInitials}
          formatTimeAgo={formatTimeAgo}
        />
      ))}

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-primary hover:underline"
        >
          {t("feed.view_all_comments").replace(
            "{{count}}",
            String(comments.length)
          )}
        </button>
      )}
    </div>
  );
};

// Add Comment Input Component
const AddCommentInput = ({ postId }: { postId: string }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [comment, setComment] = useState("");

  if (!user) return null;

  const handleSubmit = () => {
    if (!comment.trim()) return;
    toast.success(t("feed.comment_coming_soon") || "Hozzászólás hamarosan!");
    setComment("");
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <Input
        placeholder={t("feed.write_comment")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="flex-1"
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <Button size="icon" variant="ghost" onClick={handleSubmit}>
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};

// WellBot Post Card Component - Special 2-column layout
const WellBotPostCard = ({
  post,
  onLike,
  onShare,
  formatTimeAgo,
  getInitials,
}: {
  post: FeedPost;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  formatTimeAgo: (date: string) => string;
  getInitials: (name: string) => string;
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className="mb-4 overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
      {/* Indigo/Purple gradient header bar */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

      <CardContent className="p-0">
        <div className="flex">
          {/* Left: Robot Avatar Column */}
          <div className="w-20 sm:w-28 bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col items-center justify-start py-4 px-2 border-r border-indigo-100">
            {/* Robot Avatar - Using the unified WellBotAvatar component */}
            <div className="ring-4 ring-white rounded-full shadow-lg">
              <WellBotAvatar size="lg" mood="happy" />
            </div>

            {/* WellBot name */}
            <span className="mt-2 text-xs font-bold text-indigo-700">WellBot</span>

            {/* AI badge */}
            <Badge className="mt-1 text-[10px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-1.5">
              AI
            </Badge>
          </div>

          {/* Right: Content Column */}
          <div className="flex-1 p-4">
            {/* Reply indicator */}
            {post.isWellBotResponse && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 mb-2">
                <Reply className="w-3 h-3" />
                <span>{t("feed.wellbot_replied")}</span>
                <span className="text-muted-foreground">• {formatTimeAgo(post.createdAt)}</span>
              </div>
            )}

            {/* Content */}
            <p className="text-foreground leading-relaxed">
              {post.content}
            </p>

            {/* Related Program Card */}
            {post.relatedProgramId && (
              <RelatedProgramCard programId={post.relatedProgramId} />
            )}

            {/* Action Row */}
            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-indigo-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post.id)}
                className={cn("gap-1.5", post.isLikedByMe && "text-red-500")}
              >
                <Heart className={cn("w-4 h-4", post.isLikedByMe && "fill-current")} />
                {post.likes}
              </Button>

              <Button variant="ghost" size="sm" className="gap-1.5">
                <MessageCircle className="w-4 h-4" />
                {post.comments.length}
              </Button>

              {/* Primary CTA: Chat with WellBot */}
              <Button
                onClick={() => navigate("/ai-assistant")}
                size="sm"
                className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t("feed.chat_with_wellbot")}</span>
              </Button>
            </div>

            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="mt-4">
                <CommentsSection
                  comments={post.comments}
                  getInitials={getInitials}
                  formatTimeAgo={formatTimeAgo}
                />
              </div>
            )}

            {/* Add Comment Input */}
            <AddCommentInput postId={post.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Regular Post Card Component
const RegularPostCard = ({
  post,
  onLike,
  onShare,
  formatTimeAgo,
  getInitials,
}: {
  post: FeedPost;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  formatTimeAgo: (date: string) => string;
  getInitials: (name: string) => string;
}) => {
  const { t } = useLanguage();

  return (
    <Card
      className={cn(
        "mb-4 shadow-sm hover:shadow-md transition-shadow",
        post.authorRole === "expert" && "border-l-4 border-l-indigo-500"
      )}
    >
      <CardContent className="p-4">
        {/* Header: Avatar + Name + Badge + Time */}
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarFallback
              className={cn(
                post.authorRole === "expert" && "bg-indigo-100 text-indigo-700"
              )}
            >
              {getInitials(post.authorName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{post.authorName}</span>

              {/* Role Badge */}
              {post.authorRole === "expert" && (
                <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {post.authorBadge || t("feed.expert")}
                </Badge>
              )}
              {post.authorRole === "sponsor" && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  {post.authorBadge}
                </Badge>
              )}
            </div>

            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>

          {/* Post Type Badge */}
          <PostTypeBadge type={post.type} />
        </div>

        {/* Content */}
        <p className="mt-3 text-foreground whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>

        {/* Image */}
        {post.imageUrl && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img
              src={post.imageUrl}
              alt=""
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Smart Program Link (if keywords match) */}
        {post.relatedProgramId && (
          <RelatedProgramCard programId={post.relatedProgramId} />
        )}

        {/* Action Row */}
        <div className="mt-4 flex items-center gap-1 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={cn("gap-1.5", post.isLikedByMe && "text-red-500")}
          >
            <Heart
              className={cn("w-4 h-4", post.isLikedByMe && "fill-current")}
            />
            <span>{post.likes}</span>
          </Button>

          <Button variant="ghost" size="sm" className="gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments.length}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 ml-auto"
            onClick={() => onShare(post.id)}
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t("feed.share")}</span>
          </Button>
        </div>

        {/* Comments */}
        {post.comments.length > 0 && (
          <CommentsSection
            comments={post.comments}
            getInitials={getInitials}
            formatTimeAgo={formatTimeAgo}
          />
        )}

        {/* Add Comment Input */}
        <AddCommentInput postId={post.id} />
      </CardContent>
    </Card>
  );
};

// Main Post Card Component - routes to appropriate layout
const PostCard = ({
  post,
  onLike,
  onShare,
  formatTimeAgo,
  getInitials,
}: {
  post: FeedPost;
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  formatTimeAgo: (date: string) => string;
  getInitials: (name: string) => string;
}) => {
  if (post.authorRole === "wellbot") {
    return (
      <WellBotPostCard
        post={post}
        onLike={onLike}
        onShare={onShare}
        formatTimeAgo={formatTimeAgo}
        getInitials={getInitials}
      />
    );
  }

  return (
    <RegularPostCard
      post={post}
      onLike={onLike}
      onShare={onShare}
      formatTimeAgo={formatTimeAgo}
      getInitials={getInitials}
    />
  );
};

export default SocialFeed;
