import React from 'react';
import { colorPalette } from '@/lib/colors';
import ColorSwatch from './ColorSwatch';

interface ColorPaletteProps {
  title: string;
  colors: Record<string, string>;
  textColor?: string;
}

export default function ColorPalette({ title, colors, textColor = '#FFFFFF' }: ColorPaletteProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-default">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Object.entries(colors).map(([name, value]) => (
          <ColorSwatch 
            key={name} 
            colorName={name} 
            colorValue={value} 
            textColor={textColor}
          />
        ))}
      </div>
    </div>
  );
}