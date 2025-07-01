
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageToggleProps {
  currentLanguage: 'en' | 'nd';
  onLanguageChange: (language: 'en' | 'nd') => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentLanguage === 'en' ? 'EN' : 'ND'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onLanguageChange('en')}
          className={currentLanguage === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onLanguageChange('nd')}
          className={currentLanguage === 'nd' ? 'bg-accent' : ''}
        >
          isiNdebele
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
