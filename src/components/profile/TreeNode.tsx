import React from 'react';
import { ChevronRight } from 'lucide-react';
import { OrgChart } from '@/types';
import clsx from 'clsx';

interface TreeNodeProps {
  node: OrgChart;
  currentProfileId: string;
  isRoot?: boolean;
  onNodeClick?: (id: string) => void;
}

export default function TreeNode({ node, currentProfileId, isRoot = false, onNodeClick }: TreeNodeProps) {
  const isCurrentNode = node.id === currentProfileId;

  return (
    <div className={clsx(
      'relative',
      !isRoot && 'ml-6 pt-2'
    )}>
      {!isRoot && (
        <div className="absolute left-0 top-0 h-full w-6">
          <div className="absolute left-0 top-6 h-px w-6 bg-default/20" />
          <div className="absolute left-0 top-0 h-full w-px bg-default/20" />
        </div>
      )}
      <button
        onClick={() => onNodeClick?.(node.id)}
        disabled={isCurrentNode}
        className={clsx(
          'w-full text-left group transition-colors rounded-lg p-3',
          isCurrentNode ? 'bg-primary/10' : 'hover:bg-card-hover',
          'disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
      >
        <div className="flex items-center gap-3">
          <img
            src={node.avatar}
            alt={node.name}
            className={clsx(
              'w-10 h-10 rounded-full object-cover ring-2',
              isCurrentNode ? 'ring-primary' : 'ring-primary/20 group-hover:ring-primary/40'
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-default truncate">{node.name}</p>
            <p className="text-xs text-muted truncate">{node.role}</p>
          </div>
          {!isCurrentNode && (
            <ChevronRight 
              className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" 
              aria-hidden="true"
            />
          )}
        </div>
      </button>
      {node.children && node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              currentProfileId={currentProfileId}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}