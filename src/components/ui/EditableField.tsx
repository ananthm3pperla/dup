import React, { useState } from 'react';
import { Check, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditableFieldProps {
  value: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date';
  onSave: (value: string) => void;
}

export default function EditableField({ value, label, type = 'text', onSave }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="group relative">
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-2"
        >
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            autoFocus
          />
          <button
            onClick={handleSave}
            className="p-1 text-success hover:bg-success/10 rounded-md transition-colors"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-error hover:bg-error/10 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {label}
            </p>
            <p className="text-base text-gray-900 dark:text-gray-100">
              {value}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-all"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}