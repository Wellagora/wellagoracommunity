import { useLanguage } from "@/contexts/LanguageContext";

interface DemoSwitcherProps {
  activeView: 'member' | 'expert' | 'sponsor' | null;
  onViewChange: (view: 'member' | 'expert' | 'sponsor') => void;
}

export const DemoSwitcher = ({ activeView, onViewChange }: DemoSwitcherProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center bg-muted/60 rounded-lg p-1 gap-1 shadow-sm shrink-0">
      <button
        onClick={() => onViewChange('member')}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          activeView === 'member'
            ? 'bg-background text-emerald-600 shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {t('roles.explorer')}
      </button>
      <button
        onClick={() => onViewChange('expert')}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          activeView === 'expert'
            ? 'bg-background text-blue-600 shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {t('roles.expert')}
      </button>
      <button
        onClick={() => onViewChange('sponsor')}
        className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
          activeView === 'sponsor'
            ? 'bg-background text-amber-600 shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {t('roles.sponsor')}
      </button>
    </div>
  );
};

export default DemoSwitcher;
