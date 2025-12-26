import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Quote } from "lucide-react";

interface CommunityStoryBookProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommunityStoryBook = ({ open, onOpenChange }: CommunityStoryBookProps) => {
  const { t } = useLanguage();

  const stories = [
    {
      id: 1,
      gradient: "from-success to-info",
      borderColor: "border-success",
      dateKey: 'story_week.past_story_date_1',
      titleKey: 'story_week.past_story_title_1',
      authorKey: 'story_week.past_story_author_1',
      quoteKey: 'story_week.past_story_quote_1'
    },
    {
      id: 2,
      gradient: "from-warning to-accent",
      borderColor: "border-warning",
      dateKey: 'story_week.past_story_date_2',
      titleKey: 'story_week.past_story_title_2',
      authorKey: 'story_week.past_story_author_2',
      quoteKey: 'story_week.past_story_quote_2'
    },
    {
      id: 3,
      gradient: "from-purple-500 to-pink-500",
      borderColor: "border-purple-500",
      dateKey: 'story_week.past_story_date_3',
      titleKey: 'story_week.past_story_title_3',
      authorKey: 'story_week.past_story_author_3',
      quoteKey: 'story_week.past_story_quote_3'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            {t('story_week.story_book_title')}
          </DialogTitle>
          <p className="text-muted-foreground mt-2">
            {t('story_week.story_book_subtitle')}
          </p>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {stories.map((story) => (
            <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${story.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Quote className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {t(story.dateKey)}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{t(story.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t(story.authorKey)}</p>
                  </div>
                </div>
                <blockquote className={`border-l-4 ${story.borderColor} pl-4 italic text-foreground mb-4`}>
                  {t(story.quoteKey)}
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityStoryBook;
