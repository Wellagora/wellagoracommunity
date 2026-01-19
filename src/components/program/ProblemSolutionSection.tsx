import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Lightbulb, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProblemSolutionSectionProps {
  problem?: string | null;
  solution?: string | null;
}

/**
 * ProblemSolutionSection - AI-readable problem/solution visualization
 * 
 * Displays structured problem-solution content for:
 * - User understanding (clear value proposition)
 * - AI/GEO indexing (semantic structure)
 * - SEO optimization (structured content)
 */
const ProblemSolutionSection = ({ problem, solution }: ProblemSolutionSectionProps) => {
  const { language } = useLanguage();

  // Don't render if no content
  if (!problem && !solution) return null;

  const translations = {
    hu: {
      problemTitle: 'Milyen problémára ad megoldást?',
      solutionTitle: 'Hogyan segít ez neked?',
      sectionTitle: 'Mire jó ez a program?'
    },
    en: {
      problemTitle: 'What problem does this solve?',
      solutionTitle: 'How does this help you?',
      sectionTitle: 'What is this program for?'
    },
    de: {
      problemTitle: 'Welches Problem löst dies?',
      solutionTitle: 'Wie hilft dir das?',
      sectionTitle: 'Wofür ist dieses Programm?'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.hu;

  return (
    <Card className="mb-8 overflow-hidden border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 via-white to-amber-50/30">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            💡
          </span>
          {t.sectionTitle}
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Problem Section */}
          {problem && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-medium text-foreground">
                  {t.problemTitle}
                </h3>
              </div>
              <p 
                className="text-muted-foreground leading-relaxed pl-10"
                // Add semantic markup for AI crawlers
                itemProp="description"
                data-ai-field="problem"
              >
                {problem}
              </p>
            </motion.div>
          )}

          {/* Solution Section */}
          {solution && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-medium text-foreground">
                  {t.solutionTitle}
                </h3>
              </div>
              <p 
                className="text-muted-foreground leading-relaxed pl-10"
                // Add semantic markup for AI crawlers
                itemProp="teaches"
                data-ai-field="solution"
              >
                {solution}
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemSolutionSection;
