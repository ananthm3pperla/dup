import React, { useState } from 'react';
import { User, Mail, Building2, MapPin, Briefcase } from 'lucide-react';
import { Button, Input, Alert } from '@/components/ui';
import { motion } from 'framer-motion';

interface ProfileData {
  fullName: string;
  companyName: string;
  jobTitle: string;
  department: string;
  officeLocation: string;
}

interface ProfileSetupProps {
  initialData?: Partial<ProfileData>;
  onComplete: (data: ProfileData) => void;
  onSkip?: () => void;
}

export default function ProfileSetup({ initialData = {}, onComplete, onSkip }: ProfileSetupProps) {
  const [formData, setFormData] = useState<ProfileData>({
    fullName: initialData.fullName || '',
    companyName: initialData.companyName || '',
    jobTitle: initialData.jobTitle || '',
    department: initialData.department || '',
    officeLocation: initialData.officeLocation || ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name as keyof ProfileData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onComplete(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Tell us about yourself</h2>
      
      <Alert 
        variant="info" 
        className="mb-6"
      >
        <p className="text-sm">This information helps us personalize your experience and connect you with your team.</p>
      </Alert>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          leftIcon={<User className="h-5 w-5" />}
          required
          error={errors.fullName}
          helperText="This is how your name will appear to team members"
        />
        
        <Input
          label="Company Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          leftIcon={<Building2 className="h-5 w-5" />}
          required
          error={errors.companyName}
        />
        
        <Input
          label="Job Title"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          leftIcon={<Briefcase className="h-5 w-5" />}
          required
          error={errors.jobTitle}
        />
        
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Department
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Customer Success">Customer Success</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {errors.department && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.department}</p>
          )}
        </div>
        
        <Input
          label="Office Location"
          name="officeLocation"
          value={formData.officeLocation}
          onChange={handleChange}
          leftIcon={<MapPin className="h-5 w-5" />}
          placeholder="City, State"
          error={errors.officeLocation}
        />
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="submit" 
            className="w-full sm:w-auto sm:flex-1"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Continue
          </Button>
          
          {onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}