import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface DemoSwitcherProps {
  activeView: 'member' | 'expert' | 'sponsor' | null;
  onViewChange: (view: 'member' | 'expert' | 'sponsor') => void;
}

export const DemoSwitcher = ({ activeView, onViewChange }: DemoSwitcherProps) => {
  const { t } = useLanguage();

  const getViewLabel = (view: 'member' | 'expert' | 'sponsor' | null): string => {
    switch (view) {
      case 'member': return t('roles.explorer');
      case 'expert': return t('roles.expert');
      case 'sponsor': return t('roles.sponsor');
      default: return 'Admin';
    }
  };

  const getViewColor = (view: 'member' | 'expert' | 'sponsor' | null): string => {
    switch (view) {
      case 'member': return 'text-emerald-600';
      case 'expert': return 'text-blue-600';
      case 'sponsor': return 'text-amber-600';
      default: return 'text-purple-600';
    }
  };

  // Desktop: Compact dropdown
  return (
    <div className="hidden md:block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`gap-1.5 h-8 px-3 text-xs font-medium border-dashed ${getViewColor(activeView)}`}
          >
            <span className="opacity-60">Demo:</span>
            <span className="font-semibold">{getViewLabel(activeView)}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem 
            onClick={() => onViewChange('member')}
            className={activeView === 'member' ? 'bg-emerald-50 text-emerald-700' : ''}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            {t('roles.explorer')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onViewChange('expert')}
            className={activeView === 'expert' ? 'bg-blue-50 text-blue-700' : ''}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            {t('roles.expert')}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onViewChange('sponsor')}
            className={activeView === 'sponsor' ? 'bg-amber-50 text-amber-700' : ''}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
            {t('roles.sponsor')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DemoSwitcher;
