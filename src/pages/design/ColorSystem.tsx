import React from 'react';
import { colorPalette } from '@/lib/colors';
import ColorPalette from '@/components/ui/ColorPalette';
import { Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

export default function ColorSystem() {
  const { theme } = useTheme();
  
  // Primary colors
  const primaryColors = {
    'Primary 50': colorPalette.primary[50],
    'Primary 100': colorPalette.primary[100],
    'Primary 200': colorPalette.primary[200],
    'Primary 300': colorPalette.primary[300],
    'Primary 400': colorPalette.primary[400],
    'Primary 500': colorPalette.primary[500],
    'Primary 600': colorPalette.primary[600],
    'Primary 700': colorPalette.primary[700],
    'Primary 800': colorPalette.primary[800],
    'Primary 900': colorPalette.primary[900],
  };

  // Secondary colors
  const secondaryColors = {
    'Secondary 50': colorPalette.secondary[50],
    'Secondary 100': colorPalette.secondary[100],
    'Secondary 200': colorPalette.secondary[200],
    'Secondary 300': colorPalette.secondary[300],
    'Secondary 400': colorPalette.secondary[400],
    'Secondary 500': colorPalette.secondary[500],
    'Secondary 600': colorPalette.secondary[600],
    'Secondary 700': colorPalette.secondary[700],
    'Secondary 800': colorPalette.secondary[800],
    'Secondary 900': colorPalette.secondary[900],
  };

  // Accent colors
  const accentColors = {
    'Accent 50': colorPalette.accent[50],
    'Accent 100': colorPalette.accent[100],
    'Accent 200': colorPalette.accent[200],
    'Accent 300': colorPalette.accent[300],
    'Accent 400': colorPalette.accent[400],
    'Accent 500': colorPalette.accent[500],
    'Accent 600': colorPalette.accent[600],
    'Accent 700': colorPalette.accent[700],
    'Accent 800': colorPalette.accent[800],
    'Accent 900': colorPalette.accent[900],
  };

  // Gray colors
  const grayColors = {
    'Gray 50': colorPalette.gray[50],
    'Gray 100': colorPalette.gray[100],
    'Gray 200': colorPalette.gray[200],
    'Gray 300': colorPalette.gray[300],
    'Gray 400': colorPalette.gray[400],
    'Gray 500': colorPalette.gray[500],
    'Gray 600': colorPalette.gray[600],
    'Gray 700': colorPalette.gray[700],
    'Gray 800': colorPalette.gray[800],
    'Gray 900': colorPalette.gray[900],
  };

  // Semantic colors
  const semanticColors = {
    'Success': colorPalette.success.DEFAULT,
    'Success Light': colorPalette.success.light,
    'Success Dark': colorPalette.success.dark,
    'Warning': colorPalette.warning.DEFAULT,
    'Warning Light': colorPalette.warning.light,
    'Warning Dark': colorPalette.warning.dark,
    'Error': colorPalette.error.DEFAULT,
    'Error Light': colorPalette.error.light,
    'Error Dark': colorPalette.error.dark,
    'Info': colorPalette.info.DEFAULT,
    'Info Light': colorPalette.info.light,
    'Info Dark': colorPalette.info.dark,
  };

  // Interface colors
  const interfaceColors = {
    'App Background': 'var(--bg-app)',
    'Card Background': 'var(--bg-card)',
    'Card Hover': 'var(--bg-card-hover)',
    'Text Default': 'var(--text-default)',
    'Text Muted': 'var(--text-muted)',
    'Text Light': 'var(--text-light)',
    'Border Default': 'var(--border-default)',
    'Border Dark': 'var(--border-dark)',
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-default">Color System</h1>
        <p className="mt-2 text-muted">
          Current theme: <span className="font-medium">{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
        </p>
      </div>

      <div className="space-y-12">
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-default mb-6">Brand Colors</h2>
          <div className="space-y-8">
            <ColorPalette title="Primary" colors={primaryColors} />
            <ColorPalette title="Secondary" colors={secondaryColors} />
            <ColorPalette title="Accent" colors={accentColors} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-default mb-6">Grayscale</h2>
          <ColorPalette 
            title="Gray" 
            colors={grayColors} 
            textColor={theme === 'dark' || theme === 'high-contrast' ? '#FFFFFF' : '#000000'} 
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-default mb-6">Semantic Colors</h2>
          <ColorPalette title="Status" colors={semanticColors} />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-default mb-6">Interface Colors</h2>
          <ColorPalette 
            title="UI Elements" 
            colors={interfaceColors} 
            textColor={theme === 'dark' || theme === 'high-contrast' ? '#FFFFFF' : '#000000'} 
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-default mb-6">Accessibility Guidelines</h2>
          <div className="space-y-4">
            <p className="text-default">
              All color combinations in the Hi-Bridge UI must meet the following WCAG 2.1 contrast requirements:
            </p>
            <ul className="list-disc list-inside space-y-2 text-default">
              <li>Normal text (less than 18pt): <span className="font-medium text-success">4.5:1 minimum contrast ratio</span></li>
              <li>Large text (18pt or 14pt bold and larger): <span className="font-medium text-success">3:1 minimum contrast ratio</span></li>
              <li>UI components and graphical objects: <span className="font-medium text-success">3:1 minimum contrast ratio</span></li>
            </ul>
            <div className="mt-4 p-4 bg-info-bg rounded-lg">
              <p className="text-info font-medium">Contrast Indicators</p>
              <div className="mt-2 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="bg-success rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-default">Passes AA & AAA (7.0+:1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-success rounded-full p-0.5">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-default">Passes AA (4.5+:1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-error rounded-full p-0.5">
                    <AlertTriangle className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-default">Fails (Below 4.5:1)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}