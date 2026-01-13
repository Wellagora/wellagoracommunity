import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Bot,
  Reply,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MOCK_FEED_POSTS,
  FeedPost,
  MOCK_PROGRAMS,
  getLocalizedProgramTitle,
  DEMO_STATS,
} from "@/data/mockData";

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
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (isDemoMode) {
      setPosts(MOCK_FEED_POSTS);
    } else {
      // For now, use mock data even in non-demo mode
      setPosts(MOCK_FEED_POSTS);
    }
  }, [isDemoMode]);

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
            .replace("{{members}}", String(DEMO_STATS.members))
            .replace("{{experts}}", String(DEMO_STATS.experts))}
        </p>
      </div>

      {/* Post Creator */}
      {user && (
        <Card className="mb-6 border-dashed border-2 border-primary/20 hover:border-primary/40 transition-colors">
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
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{t("feed.no_posts")}</p>
        </Card>
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
      icon: Bot,
      label: t("feed.wellbot_suggestion"),
      className: "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700",
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

  const program = MOCK_PROGRAMS.find((p) => p.id === programId);
  if (!program) return null;

  return (
    <div
      onClick={() => navigate(`/piacter/${programId}`)}
      className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200 cursor-pointer hover:shadow-md transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-600 font-medium">
            {t("feed.related_program")}
          </p>
          <p className="font-semibold text-sm truncate group-hover:text-emerald-700">
            {getLocalizedProgramTitle(program, language)}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Sponsor Attribution */}
      {program.sponsor_name && (
        <p className="mt-2 text-xs text-emerald-600/70 flex items-center gap-1">
          <Gift className="w-3 h-3" />
          {t("feed.sponsored_by")}: {program.sponsor_name}
        </p>
      )}
    </div>
  );
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

// Main Post Card Component
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
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <Card
      className={cn(
        "mb-4 shadow-sm hover:shadow-md transition-shadow",
        post.authorRole === "expert" && "border-l-4 border-l-indigo-500",
        post.authorRole === "wellbot" &&
          "border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-teal-50/50"
      )}
    >
      <CardContent className="p-4">
        {/* Header: Avatar + Name + Badge + Time */}
        <div className="flex items-start gap-3">
          <Avatar
            className={cn(
              post.authorRole === "wellbot" &&
                "ring-2 ring-emerald-500 ring-offset-2"
            )}
          >
            <AvatarFallback
              className={cn(
                post.authorRole === "expert" && "bg-indigo-100 text-indigo-700",
                post.authorRole === "wellbot" && "bg-emerald-100 text-emerald-700"
              )}
            >
              {post.authorRole === "wellbot" ? (
                <Bot className="w-5 h-5" />
              ) : (
                getInitials(post.authorName)
              )}
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
              {post.authorRole === "wellbot" && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs gap-1">
                  <Bot className="w-3 h-3" />
                  {post.authorBadge || t("feed.ai_assistant")}
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

        {/* WellBot Reply Indicator */}
        {post.isWellBotResponse && (
          <div className="mt-3 mb-2 flex items-center gap-2 text-xs text-emerald-600">
            <Reply className="w-3 h-3" />
            <span>{t("feed.wellbot_replied")}</span>
          </div>
        )}

        {/* Content */}
        <p className={cn(
          "text-foreground whitespace-pre-wrap leading-relaxed",
          !post.isWellBotResponse && "mt-3"
        )}>
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

        {/* WellBot Chat Button */}
        {post.authorRole === "wellbot" && (
          <div className="mt-3 pt-3 border-t border-emerald-200">
            <Button
              onClick={() => navigate("/ai-assistant")}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t("feed.chat_with_wellbot")}
            </Button>
          </div>
        )}

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

export default SocialFeed;
