import React, { useState } from 'react';
import { Mail, Building2, Users, MapPin, Edit, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  name: string;
  role: string;
  department: string;
  avatar: string;
  email: string;
  location?: string;
  phone?: string;
  employeeId?: string;
  preferredName?: string;
  workLocation?: string;
  isCurrentUser?: boolean;
}

export default function ProfileHeader({
  name,
  role,
  department,
  avatar,
  email,
  location,
  phone,
  employeeId,
  preferredName,
  workLocation,
  isCurrentUser = false
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const handleEditProfile = () => {
    navigate('/settings');
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-md relative">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div 
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <img
            src={avatar}
            alt={name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
          />
          {isCurrentUser && isHovering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer">
              <Edit className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-default truncate">
                {name}
              </h1>
              {preferredName && (
                <p className="text-sm text-muted mt-1">
                  Preferred Name: {preferredName}
                </p>
              )}
              <p className="mt-1 text-lg text-muted">{role || 'Not specified'}</p>
            </div>
            {employeeId && (
              <div className="text-sm text-muted">
                Employee ID: {employeeId}
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="text-sm">
              <span className="text-muted">Department:</span>{" "}
              <span className="text-default">{department || 'Not specified'}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted">Email:</span>{" "}
              <a href={`mailto:${email}`} className="text-primary hover:underline flex items-center gap-1">
                {email}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {location && (
              <div className="text-sm">
                <span className="text-muted">Location:</span>{" "}
                <span className="text-default">{location}</span>
              </div>
            )}
            {phone && (
              <div className="text-sm">
                <span className="text-muted">Phone:</span>{" "}
                <a href={`tel:${phone}`} className="text-primary hover:underline flex items-center gap-1">
                  {phone}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {workLocation && (
              <div className="text-sm">
                <span className="text-muted">Work Mode:</span>{" "}
                <span className="text-default">{workLocation}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="absolute top-6 right-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditProfile}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Edit Profile
          </Button>
        </div>
      )}
    </div>
  );
}