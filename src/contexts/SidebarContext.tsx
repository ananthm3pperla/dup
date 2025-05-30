import React, { createContext, useContext, useState } from 'react';
import { useSessionStorage } from '@/lib/hooks/useSessionStorage';

type SidebarState = 'expanded' | 'collapsed';

interface SidebarContextType {
  sidebarState: SidebarState;
  toggleSidebar: () => void;
  setSidebarState: (state: SidebarState) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Use state directly instead of localStorage
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');

  const toggleSidebar = () => {
    setSidebarState(sidebarState === 'expanded' ? 'collapsed' : 'expanded');
  };

  return (
    <SidebarContext.Provider value={{ sidebarState, toggleSidebar, setSidebarState }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}