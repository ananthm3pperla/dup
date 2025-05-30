import React from 'react';
import { Plus } from 'lucide-react';
import { EditableEducation } from '@/components/profile';
import type { Education } from '@/types';

interface EducationTabProps {
  profile: any;
  canEdit?: boolean;
  isSaving?: boolean;
  onAdd?: () => void;
  onSave?: (index: number, data: Education) => void;
  onDelete?: (index: number) => void;
}

export default function EducationTab({
  profile,
  canEdit = false,
  isSaving = false,
  onAdd,
  onSave,
  onDelete
}: EducationTabProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-default">Education</h2>
        {canEdit && (
          <button
            onClick={onAdd}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add Education
          </button>
        )}
      </div>
      <div className="space-y-6">
        {profile.member_education && profile.member_education.length > 0 ? (
          profile.member_education.map((edu: Education, index: number) => (
            <EditableEducation
              key={index}
              education={edu}
              index={index}
              onSave={onSave}
              onDelete={onDelete}
              canEdit={canEdit}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted">
            <p>No education history available</p>
          </div>
        )}
      </div>
    </div>
  );
}