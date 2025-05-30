import React from 'react';
import { colorPalette, getContrastRatio } from '@/lib/colors';
import { Check, AlertTriangle } from 'lucide-react';

interface ColorSwatchProps {
  colorName: string;
  colorValue: string;
  textColor?: string;
  showContrast?: boolean;
}

export default function ColorSwatch({ 
  colorName, 
  colorValue, 
  textColor = '#FFFFFF',
  showContrast = true
}: ColorSwatchProps) {
  const contrastRatio = showContrast ? getContrastRatio(textColor, colorValue) : 0;
  const meetsAA = contrastRatio >= 4.5;
  const meetsAAA = contrastRatio >= 7;
  
  return (
    <div className="flex flex-col">
      <div 
        className="h-16 rounded-md flex items-center justify-center mb-2 relative"
        style={{ backgroundColor: colorValue }}
      >
        <span 
          className="font-medium"
          style={{ color: textColor }}
        >
          Aa
        </span>
        
        {showContrast && (
          <div className="absolute bottom-1 right-1 flex items-center gap-1">
            {meetsAAA ? (
              <div className="bg-white/90 dark:bg-black/90 text-success rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            ) : meetsAA ? (
              <div className="bg-white/90 dark:bg-black/90 text-success rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-black/90 text-error rounded-full p-0.5">
                <AlertTriangle className="h-3 w-3" />
              </div>
            )}
          </div>
        )}
      </div>
      <div className="text-xs">
        <p className="font-medium text-default">{colorName}</p>
        <p className="text-muted">{colorValue}</p>
        {showContrast && (
          <p className={`text-xs ${
            meetsAAA ? 'text-success' : 
            meetsAA ? 'text-success' : 
            'text-error'
          }`}>
            {contrastRatio.toFixed(2)}:1
            {meetsAAA ? ' (AAA)' : meetsAA ? ' (AA)' : ' (Fails)'}
          </p>
        )}
      </div>
    </div>
  );
}