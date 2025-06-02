import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Moon,
  Settings as SettingsIcon,
  Shield,
  Key,
  Mail,
  Globe,
  Palette,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button, PageHeader } from "@/components/ui";
import {
  ThemeSettings,
  ProfileSettings,
  AccountSettings,
} from "@/components/settings";
import { BackButton } from "@/components/navigation/BackButton";
import { toast } from "sonner";

type SettingsSection =
  | "profile"
  | "account"
  | "notifications"
  | "appearance"
  | "security"
  | "preferences";

interface NavigationItem {
  id: SettingsSection;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  // Navigation items with React components as icons instead of functions
  const navigationItems: NavigationItem[] = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      description: "Manage your personal information",
    },
    {
      id: "account",
      label: "Account",
      icon: <Key className="h-5 w-5" />,
      description: "Manage your account settings",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      description: "Configure how you receive notifications",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette className="h-5 w-5" />,
      description: "Customize the look and feel",
    },
    {
      id: "security",
      label: "Security",
      icon: <Shield className="h-5 w-5" />,
      description: "Manage your security settings",
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: <SettingsIcon className="h-5 w-5" />,
      description: "Set your app preferences",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "account":
        return <AccountSettings />;
      case "appearance":
        return <ThemeSettings />;
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "preferences":
        return renderPreferencesSettings();
      default:
        return null;
    }
  };

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-4">
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Notifications
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive updates via email
                </p>
              </div>
            </div>
            <button
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="switch"
              aria-checked="true"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Browser Notifications
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive in-app notifications
                </p>
              </div>
            </div>
            <button
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="switch"
              aria-checked="true"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Schedule Reminders
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get reminders for your schedule
                </p>
              </div>
            </div>
            <button
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="switch"
              aria-checked="false"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => toast.success("Notification settings saved")}>
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-4">
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Setup 2FA
            </Button>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Active Sessions
            </h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Current Session
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Started 2 hours ago • Chrome on Windows
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                  Active
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-center"
              >
                Log Out All Other Devices
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPreferencesSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-4">
          App Preferences
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Language
            </label>
            <div className="mt-1 flex items-center">
              <Globe className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
              <select
                id="language"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="en-US">English (US)</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Digest
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Weekly summary of your activity
                </p>
              </div>
            </div>
            <button
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="switch"
              aria-checked="true"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sound Effects
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Play sounds for notifications
                </p>
              </div>
            </div>
            <button
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              role="switch"
              aria-checked="false"
            >
              <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => toast.success("Preferences saved")}>
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );

  const currentSection = navigationItems.find(
    (item) => item.id === activeSection,
  );

  return (
    <div className="container mx-auto max-w-7xl">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        showBackButton={true}
        backButtonTo="/dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1" aria-label="Settings">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`
                    flex items-center gap-3 w-full px-4 py-3 text-left text-sm rounded-lg transition-colors
                    ${
                      activeSection === item.id
                        ? "bg-primary text-white font-medium"
                        : "text-muted hover:bg-card-hover hover:text-default"
                    }
                  `}
                  aria-current={activeSection === item.id ? "page" : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {currentSection && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={currentSection.id}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-default">
                  {currentSection.label}
                </h2>
                <p className="text-sm text-muted mt-1">
                  {currentSection.description}
                </p>
              </div>

              {renderContent()}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
