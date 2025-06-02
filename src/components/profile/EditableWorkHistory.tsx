import React, { useState } from "react";
import { Pencil, X, Plus } from "lucide-react";
import { WorkHistory } from "../../types";
import { Button } from "@/components/ui";

interface EditableWorkHistoryProps {
  work: WorkHistory;
  index: number;
  onSave: (index: number, data: WorkHistory) => void;
  onDelete: (index: number) => void;
  canEdit: boolean;
}

export default function EditableWorkHistory({
  work,
  index,
  onSave,
  onDelete,
  canEdit,
}: EditableWorkHistoryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedWork, setEditedWork] = useState(work);

  const handleSave = () => {
    onSave(index, editedWork);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="border-l-2 border-primary/20 pl-4 space-y-4 bg-card-hover p-4 rounded-lg">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-default">
            Role/Title
          </label>
          <input
            type="text"
            value={editedWork.role}
            onChange={(e) =>
              setEditedWork({ ...editedWork, role: e.target.value })
            }
            className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Role"
          />

          <label className="block text-sm font-medium text-default mt-3">
            Company
          </label>
          <input
            type="text"
            value={editedWork.company}
            onChange={(e) =>
              setEditedWork({ ...editedWork, company: e.target.value })
            }
            className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Company"
          />

          <label className="block text-sm font-medium text-default mt-3">
            Location
          </label>
          <input
            type="text"
            value={editedWork.location}
            onChange={(e) =>
              setEditedWork({ ...editedWork, location: e.target.value })
            }
            className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Location"
          />

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="block text-sm font-medium text-default">
                Start Date
              </label>
              <input
                type="text"
                value={editedWork.startDate}
                onChange={(e) =>
                  setEditedWork({ ...editedWork, startDate: e.target.value })
                }
                className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="YYYY-MM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-default">
                End Date
              </label>
              <input
                type="text"
                value={editedWork.endDate || ""}
                onChange={(e) =>
                  setEditedWork({ ...editedWork, endDate: e.target.value })
                }
                className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="YYYY-MM or leave blank for present"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-default">
            Highlights
          </label>
          {editedWork.highlights.map((highlight, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={highlight}
                onChange={(e) => {
                  const newHighlights = [...editedWork.highlights];
                  newHighlights[i] = e.target.value;
                  setEditedWork({ ...editedWork, highlights: newHighlights });
                }}
                className="block w-full rounded-md border-default bg-card text-default shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              <button
                onClick={() => {
                  const newHighlights = editedWork.highlights.filter(
                    (_, index) => index !== i,
                  );
                  setEditedWork({ ...editedWork, highlights: newHighlights });
                }}
                className="p-2 text-error hover:bg-error/10 rounded-md"
                aria-label="Remove highlight"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setEditedWork({
                ...editedWork,
                highlights: [...editedWork.highlights, ""],
              })
            }
            className="flex items-center gap-1 text-sm text-primary hover:text-primary-light"
          >
            <Plus className="h-4 w-4" /> Add Highlight
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
          <Button onClick={handleSave} size="sm">
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
          <h3 className="text-base font-medium text-default">
            {work.role || "Not specified"}
          </h3>
          <p className="text-sm text-muted mb-1">
            {work.company || "Not specified"}
          </p>
          <p className="text-xs text-muted mb-2">
            {work.location || "Not specified"}
          </p>
          <p className="text-xs text-muted mb-3">
            {work.startDate || "Not specified"} - {work.endDate || "Present"}
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-muted hover:text-default hover:bg-card-hover rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit work history"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>
      <ul className="list-disc list-inside space-y-1">
        {work.highlights && work.highlights.length > 0 ? (
          work.highlights.map((highlight, i) => (
            <li key={i} className="text-sm text-default">
              {highlight || "Not specified"}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted italic">No highlights provided</li>
        )}
      </ul>
    </div>
  );
}
