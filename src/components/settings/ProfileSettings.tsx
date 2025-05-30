import React, { useState, useEffect } from 'react';
import { User, Mail, Building2, MapPin, Briefcase } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { isDemoMode, DEMO_USER } from '@/lib/demo';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    department: '',
    location: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Check if in demo mode
        if (isDemoMode()) {
          // Use mock data for demo mode that matches DEMO_USER
          setFormData({
            fullName: DEMO_USER.full_name,
            jobTitle: 'Founder/CEO',
            department: 'C-Suite',
            location: 'Dallas, TX',
            bio: 'Engineering leader with a passion for building scalable systems and mentoring teams. Focused on cloud-native architectures and DevOps practices.'
          });
          
          setAvatarUrl(DEMO_USER.avatar_url);
          setIsLoading(false);
          return;
        }
        
        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') throw error;
        
        // Get onboarding data
        const { data: onboardingData, error: onboardingError } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (onboardingError && onboardingError.code !== 'PGRST116') {
          console.error('Error loading onboarding data:', onboardingError);
        }
        
        // Set form data
        setFormData({
          fullName: data?.full_name || user?.user_metadata?.full_name || '',
          jobTitle: onboardingData?.job_title || '',
          department: onboardingData?.department || '',
          location: data?.location || onboardingData?.office_location || '',
          bio: data?.bio || ''
        });
        
        // Set avatar URL
        setAvatarUrl(data?.avatar_url || user?.user_metadata?.avatar_url || null);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Skip API calls in demo mode
      if (isDemoMode()) {
        toast.success('Profile updated successfully (Demo Mode)');
        setIsSubmitting(false);
        return;
      }
      
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        newAvatarUrl = publicUrl;
        
        // Update user metadata
        const { error: updateUserError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });
        
        if (updateUserError) throw updateUserError;
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          location: formData.location,
          bio: formData.bio,
          avatar_url: newAvatarUrl
        });
        
      if (profileError) throw profileError;
      
      // Update onboarding data
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          job_title: formData.jobTitle,
          department: formData.department,
          office_location: formData.location
        });
        
      if (onboardingError) {
        console.warn('Error updating onboarding data:', onboardingError);
        // Don't throw, as this is not critical
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-default mb-6">Personal Information</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {(avatarPreview || avatarUrl) && (
                <img 
                  src={avatarPreview || avatarUrl || ''} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              )}
              {!avatarPreview && !avatarUrl && (
                <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20 text-primary text-xl font-semibold">
                  {formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              )}
            </div>
            <label 
              htmlFor="avatar-upload" 
              className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <div>
            <h4 className="text-sm font-medium text-default">Profile Picture</h4>
            <p className="text-xs text-muted mt-1">
              Upload a photo to personalize your profile
            </p>
          </div>
        </div>
        
        <Input
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          leftIcon={<User className="h-5 w-5" />}
          required
        />
        
        <Input
          label="Job Title"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleInputChange}
          leftIcon={<Briefcase className="h-5 w-5" />}
        />
        
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Department
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
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
        </div>
        
        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          leftIcon={<MapPin className="h-5 w-5" />}
          placeholder="City, State"
        />
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleInputChange}
            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
            placeholder="Tell us a bit about yourself..."
          />
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}