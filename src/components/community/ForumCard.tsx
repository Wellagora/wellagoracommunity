import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  MessageCircle, 
  Users, 
  Pin, 
  TrendingUp, 
  Clock
} from "lucide-react";

interface ForumPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  replies: number;
  views: number;
  lastActivity: string;
  isPinned: boolean;
  isHot: boolean;
}

interface ForumCardProps {
  forum: {
    id: string;
    name: string;
    description: string;
    category: string;
    posts: number;
    members: number;
    color: string;
    recentPosts: ForumPost[];
  };
  onViewForum?: (forumId: string) => void;
}

const ForumCard = ({ forum, onViewForum }: ForumCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card className="hover:shadow-eco transition-smooth">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${forum.color}`}></div>
              <CardTitle className="text-lg">{forum.name}</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              {forum.description}
            </CardDescription>
          </div>
          <Badge variant="outline">{forum.category}</Badge>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{forum.posts} {t('community.posts_count')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{forum.members} {t('community.members_count')}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Recent Posts */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">{t('community.recent_posts')}</h4>
          {forum.recentPosts.slice(0, 2).map((post) => (
            <div key={post.id} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback>{post.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {post.isPinned && <Pin className="w-3 h-3 text-primary" />}
                  {post.isHot && <TrendingUp className="w-3 h-3 text-destructive" />}
                  <h5 className="font-medium text-sm truncate">{post.title}</h5>
                </div>
                <p className="text-xs text-muted-foreground truncate">{post.excerpt}</p>
                <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                  <span>{t('community.by')} {post.author.name}</span>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{post.replies}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{post.lastActivity}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onViewForum?.(forum.id)}
        >
          {t('community.view_forum')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ForumCard;