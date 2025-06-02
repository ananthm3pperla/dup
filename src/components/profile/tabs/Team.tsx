import React from "react";
import { Building2 } from "lucide-react";
import TreeNode from "@/components/profile/TreeNode";
import { getOrgChart } from "@/lib/mockData";
import type { TabComponentProps } from "@/types";

export default function Team({ profile, onNodeClick }: TabComponentProps) {
  const orgChart = getOrgChart(profile.member_id);

  if (!orgChart) {
    return (
      <div className="bg-card rounded-lg p-6 shadow-md">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-default mb-2">
            No Team Data
          </h3>
          <p className="text-sm text-muted text-center max-w-md">
            Organization structure information is not available for this
            profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <h2 className="text-xl font-semibold text-default mb-4">
        Team Structure
      </h2>
      <div className="overflow-x-auto">
        <div className="min-w-[600px] pb-6">
          <TreeNode
            node={orgChart}
            currentProfileId={profile.member_id}
            isRoot
            onNodeClick={onNodeClick}
          />
        </div>
      </div>
    </div>
  );
}
