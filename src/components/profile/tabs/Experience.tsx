import React from 'react';
import { Plus } from 'lucide-react';
import { EditableWorkHistory } from '@/components/profile';
import type { WorkHistory } from '@/types';

interface ExperienceProps {
  profile: any;
  canEdit?: boolean;
  isSaving?: boolean;
  onAdd?: () => void;
  onSave?: (index: number, data: WorkHistory) => void;
  onDelete?: (index: number) => void;
}

export default function Experience({
  profile,
  canEdit = false,
  isSaving = false,
  onAdd,
  onSave,
  onDelete
}: ExperienceProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-default">Work History</h2>
        {canEdit && (
          <button
            onClick={onAdd}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add Experience
          </button>
        )}
      </div>
      <div className="space-y-6">
        {profile.member_work_history && profile.member_work_history.length > 0 ? (
          profile.member_work_history.map((work: WorkHistory, index: number) => (
            <EditableWorkHistory
              key={index}
              work={work}
              index={index}
              onSave={onSave}
              onDelete={onDelete}
              canEdit={canEdit}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted">
            {canEdit ? (
              <div>
                <p className="mb-4">No work history available. Add your professional experience.</p>
                <button
                  onClick={onAdd}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Add First Experience
                </button>
              </div>
            ) : (
              <p>No work history available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}