import React from 'react';
import { Briefcase, GraduationCap, Users, Activity } from 'lucide-react';
import { TabType } from '../../lib/types';

interface TabProps {
  label: string;
  value: TabType;
  icon: React.ElementType;
  current: TabType;
  onClick: (tab: TabType) => void;
}

function Tab({ label, value, icon: Icon, current, onClick }: TabProps) {
  const isActive = current === value;
  
  return (
    <button
      onClick={() => onClick(value)}
      className={`
        flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
        ${isActive 
          ? 'bg-primary text-white' 
          : 'text-muted hover:text-default hover:bg-card-hover'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

interface ProfileTabsProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function ProfileTabs({ currentTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-default">
      <div className="flex gap-2 overflow-x-auto">
        <Tab
          label="Experience"
          value="experience"
          icon={Briefcase}
          current={currentTab}
          onClick={onTabChange}
        />
        <Tab
          label="Education"
          value="education"
          icon={GraduationCap}
          current={currentTab}
          onClick={onTabChange}
        />
        <Tab
          label="Team"
          value="team"
          icon={Users}
          current={currentTab}
          onClick={onTabChange}
        />
        <Tab
          label="Activity"
          value="activity"
          icon={Activity}
          current={currentTab}
          onClick={onTabChange}
        />
      </div>
    </div>
  );
}