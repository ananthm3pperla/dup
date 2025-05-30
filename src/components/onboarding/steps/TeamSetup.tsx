import React, { useState } from 'react';
import { Users, Building2, Clock, Info } from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';

interface TeamData {
  name: string;
  description?: string;
  requiredDays: number;
  hasCoreHours: boolean;
  coreHours?: {
    start: string;
    end: string;
  };
}

interface TeamSetupProps {
  initialData?: Partial<TeamData>;
  onComplete: (data: TeamData) => void;
  onBack: () => void;
}

export default function TeamSetup({ initialData = {}, onComplete, onBack }: TeamSetupProps) {
  const [formData, setFormData] = useState<TeamData>({
    name: initialData.name || '',
    description: initialData.description || '',
    requiredDays: initialData.requiredDays || 2,
    hasCoreHours: initialData.hasCoreHours !== undefined ? initialData.hasCoreHours : true,
    coreHours: initialData.coreHours || {
      start: '10:00',
      end: '16:00'
    }
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TeamData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects (core hours)
    if (name.startsWith('coreHours.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        coreHours: {
          ...prev.coreHours!,
          [field]: value
        }
      }));
    } else {
      // Handle normal fields
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'requiredDays' ? parseInt(value, 10) : value 
      }));
    }
    
    // Clear error when typing
    if (errors[name as keyof TeamData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCoreHoursToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasCoreHours = e.target.checked;
    setFormData(prev => ({
      ...prev,
      hasCoreHours,
      coreHours: hasCoreHours ? { start: '10:00', end: '16:00' } : undefined
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof TeamData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Team name must be at least 2 characters';
    }
    
    if (formData.hasCoreHours && formData.coreHours) {
      if (formData.coreHours.start >= formData.coreHours.end) {
        newErrors.coreHours = 'End time must be after start time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onComplete(formData);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Set up your team</h2>
      
      <Alert
        variant="info"
        className="mb-4"
      >
        <p className="text-sm">Team settings help coordinate hybrid work for your team members.</p>
      </Alert>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Team Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          leftIcon={<Users className="h-5 w-5" />}
          required
          error={errors.name}
        />
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Describe your team's purpose and goals"
          />
        </div>
        
        <div>
          <label htmlFor="requiredDays" className="block text-sm font-medium text-gray-700">
            Required Office Days per Week
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="requiredDays"
              name="requiredDays"
              value={formData.requiredDays}
              onChange={handleChange}
              className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value={0}>No requirement</option>
              <option value={1}>1 day per week</option>
              <option value={2}>2 days per week</option>
              <option value={3}>3 days per week</option>
              <option value={4}>4 days per week</option>
              <option value={5}>5 days per week</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasCoreHours"
              checked={formData.hasCoreHours}
              onChange={handleCoreHoursToggle}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="hasCoreHours" className="ml-2 block text-sm text-gray-900">
              Set core hours
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Core hours are times when team members should be present in the office
          </p>
        </div>

        {formData.hasCoreHours && (
          <div className="pl-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="coreHours.start" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="coreHours.start"
                    name="coreHours.start"
                    value={formData.coreHours?.start}
                    onChange={handleChange}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required={formData.hasCoreHours}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="coreHours.end" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="coreHours.end"
                    name="coreHours.end"
                    value={formData.coreHours?.end}
                    onChange={handleChange}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    required={formData.hasCoreHours}
                  />
                </div>
              </div>
            </div>
            {errors.coreHours && (
              <p className="text-sm text-red-600">{errors.coreHours}</p>
            )}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button type="submit">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}