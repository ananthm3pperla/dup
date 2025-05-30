import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui';
import { THEME_OPTIONS } from '@/lib/utils/themeUtils';
import * as LucideIcons from 'lucide-react';

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-default mb-4">Theme Settings</h3>
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Choose how Hi-Bridge looks to you. Select a theme preference.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {THEME_OPTIONS.map((item) => {
            const Icon = LucideIcons[item.icon as keyof typeof LucideIcons];
            const isActive = theme === item.id as any;
            
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`
                  p-4 rounded-lg border transition-all duration-200 text-left
                  ${isActive 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/50' 
                    : 'border-default hover:border-primary/50 hover:bg-card-hover'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-full
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-gray-100 dark:bg-gray-700 text-muted'
                    }
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${isActive ? 'text-primary' : 'text-default'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}