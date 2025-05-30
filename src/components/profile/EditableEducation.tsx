import React, { useState } from 'react';
import { Pencil, X, Plus } from 'lucide-react';
import { Education } from '../../types';
import { Button } from '@/components/ui';

interface EditableEducationProps {
  education: Education;
  index: number;
  onSave: (index: number, data: Education) => void;
  onDelete: (index: number) => void;
  canEdit: boolean;
}

export default function EditableEducation({ 
  education, 
  index, 
  onSave, 
  onDelete, 
  canEdit 
}: EditableEducationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEducation, setEditedEducation] = useState(education);

  const handleSave = () => {
    onSave(index, editedEducation);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border-l-2 border-primary/20 pl-4 space-y-4 bg-card-hover p-4 rounded-lg">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-default">School/University</label>
          <input
            type="text"
            value={editedEducation.school}
            onChange={(e) => setEditedEducation({ ...editedEducation, school: e.target.value })}
            className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="School"
          />
          
          <label className="block text-sm font-medium text-default mt-3">Degree</label>
          <input
            type="text"
            value={editedEducation.degree}
            onChange={(e) => setEditedEducation({ ...editedEducation, degree: e.target.value })}
            className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Degree"
          />
          
          <label className="block text-sm font-medium text-default mt-3">Field of Study</label>
          <input
            type="text"
            value={editedEducation.field}
            onChange={(e) => setEditedEducation({ ...editedEducation, field: e.target.value })}
            className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Field of Study"
          />
          
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="block text-sm font-medium text-default">Start Year</label>
              <input
                type="number"
                value={editedEducation.startYear}
                onChange={(e) => setEditedEducation({ ...editedEducation, startYear: parseInt(e.target.value) })}
                className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Start Year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-default">End Year</label>
              <input
                type="number"
                value={editedEducation.endYear}
                onChange={(e) => setEditedEducation({ ...editedEducation, endYear: parseInt(e.target.value) })}
                className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="End Year (or leave blank if current)"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-default">Honors & Awards</label>
          {editedEducation.honors?.map((honor, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={honor}
                onChange={(e) => {
                  const newHonors = [...(editedEducation.honors || [])];
                  newHonors[i] = e.target.value;
                  setEditedEducation({ ...editedEducation, honors: newHonors });
                }}
                className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Honor or award"
              />
              <button
                onClick={() => {
                  const newHonors = editedEducation.honors?.filter((_, index) => index !== i);
                  setEditedEducation({ ...editedEducation, honors: newHonors });
                }}
                className="p-2 text-error hover:bg-error/10 rounded-md"
                aria-label="Remove honor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setEditedEducation({
              ...editedEducation,
              honors: [...(editedEducation.honors || []), '']
            })}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary-light"
          >
            <Plus className="h-4 w-4" /> Add Honor
          </button>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
          >
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(index)}
            className="text-error hover:bg-error/10 hover:text-error border-error/20"
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-l-2 border-primary/20 pl-4 group p-4 rounded-lg hover:bg-card-hover transition-all duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-base font-medium text-default">{education.school || 'Not specified'}</h3>
          <p className="text-sm text-muted mb-1">{education.degree || 'Not specified'}</p>
          <p className="text-xs text-muted mb-2">{education.field || 'Not specified'}</p>
          <p className="text-xs text-muted mb-3">
            {education.startYear || 'Not specified'} - {education.endYear || 'Present'}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-muted hover:text-default hover:bg-card-hover rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit education"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>
      {education.honors && education.honors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {education.honors.map((honor, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
            >
              {honor}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted italic">No honors or awards listed</p>
      )}
    </div>
  );
}