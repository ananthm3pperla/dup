import React from 'react';
import { Building2 } from 'lucide-react';
import TreeNode from '../../../components/profile/TreeNode';
import { getOrgChart } from '../../../lib/mockData';

interface TeamProps {
  employeeId: string;
  onNodeClick: (id: string) => void;
}

export default function Team({ employeeId, onNodeClick }: TeamProps) {
  const orgChart = getOrgChart(employeeId);
  
  if (!orgChart) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-md">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-default mb-2">No Organization Data</h3>
          <p className="text-sm text-muted text-center max-w-md">
            Organization structure information is not available for this profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold text-default mb-6">Organization Structure</h2>
      <div className="overflow-x-auto">
        <div className="min-w-[600px] pb-6">
          <TreeNode
            node={orgChart}
            currentProfileId={employeeId}
            isRoot
            onNodeClick={onNodeClick}
          />
        </div>
      </div>
    </div>
  );
}