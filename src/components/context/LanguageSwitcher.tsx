import React from 'react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language } from './LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
}

export function LanguageSwitcher({ 
  variant = 'ghost', 
  size = 'default', 
  showLabel = false 
}: LanguageSwitcherProps) {
  const { language, setLanguage, t, isRTL } = useLanguage();

  const languages = [
    { 
      code: 'en' as Language, 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸'
    },
    { 
      code: 'ar' as Language, 
      name: 'Arabic', 
      nativeName: 'العربية',
      flag: '🇸🇦'
    },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {t('common.language')}
            </span>
          )}
          <span className="text-sm font-medium">
            {currentLanguage?.flag} {currentLanguage?.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align={isRTL ? 'start' : 'end'} 
        className="w-48"
        sideOffset={5}
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center justify-between cursor-pointer ${
              language === lang.code ? 'bg-primary/10' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">{lang.name}</span>
              </div>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}