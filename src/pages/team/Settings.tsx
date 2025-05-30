import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Bell, Mail, Lock, Moon, Globe, Building2 } from 'lucide-react';
import { Card, Button, PageHeader } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';
import ThemeSettings from '@/components/settings/ThemeSettings';
import { BackButton } from '@/components/navigation/BackButton';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    email: user?.email || ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    slack: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${notifications[type] ? 'disabled' : 'enabled'}`);
  };

  const handleSave = () => {
    // Save changes logic
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Team Settings"
        description="Manage your team's settings and preferences"
        showBackButton={true}
        backButtonTo="/teams"
        action={
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Team Information */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <Card.Title>Team Information</Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Team Name</label>
                <input
                  type="text"
                  name="teamName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Engineering Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Team description..."
                ></textarea>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* RTO Policy */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <Card.Title>RTO Policy</Card.Title>
              <Card.Description>
                Configure your team's return-to-office requirements
              </Card.Description>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Required Office Days per Week
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="0">No requirement</option>
                  <option value="1">1 day per week</option>
                  <option value="2">2 days per week</option>
                  <option value="3" selected>3 days per week</option>
                  <option value="4">4 days per week</option>
                  <option value="5">5 days per week</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="hasCoreHours"
                    type="checkbox"
                    checked={true}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="hasCoreHours" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Set core hours (when team members should be present in office)
                  </label>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">Start Time</label>
                    <input
                      type="time"
                      value="10:00"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400">End Time</label>
                    <input
                      type="time"
                      value="16:00"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Notification Settings */}
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <Card.Title>Notification Settings</Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Team members receive updates via email</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${notifications.email ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                      transition duration-200 ease-in-out
                      ${notifications.email ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Push Notifications</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Team members receive browser notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('push')}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                    ${notifications.push ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                      transition duration-200 ease-in-out
                      ${notifications.push ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}