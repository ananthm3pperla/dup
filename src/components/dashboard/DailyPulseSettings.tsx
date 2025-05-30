import React, { useState } from 'react';
import { Settings, Bell, Save, X, AlertCircle } from 'lucide-react';
import { usePulseStore } from '@/lib/store/pulseStore';

interface DailyPulseSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyPulseSettings({ isOpen, onClose }: DailyPulseSettingsProps) {
  const { notificationPreferences, updateNotificationPreferences } = usePulseStore();
  const [prefs, setPrefs] = useState(notificationPreferences);

  if (!isOpen) return null;

  const handleSave = () => {
    updateNotificationPreferences(prefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Daily Pulse Settings
                </h3>
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={prefs.enabled}
                        onChange={(e) => setPrefs(p => ({ ...p, enabled: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-900">Enable notifications</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 ml-6">
                      Receive notifications based on team members' daily pulses
                    </p>
                  </div>

                  {prefs.enabled && (
                    <>
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={prefs.notifyTeamLeader}
                            onChange={(e) => setPrefs(p => ({ ...p, notifyTeamLeader: e.target.checked }))}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-900">Notify team leader</span>
                        </label>
                        <p className="mt-1 text-xs text-gray-500 ml-6">
                          Send notifications to team leader when thresholds are met
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Notify after consecutive challenging days
                          </label>
                          <select
                            value={prefs.consecutiveChallenging}
                            onChange={(e) => setPrefs(p => ({ ...p, consecutiveChallenging: Number(e.target.value) }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          >
                            {[2, 3, 4, 5].map(n => (
                              <option key={n} value={n}>{n} days</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Notify after challenging days per week
                          </label>
                          <select
                            value={prefs.challengingPerWeek}
                            onChange={(e) => setPrefs(p => ({ ...p, challengingPerWeek: Number(e.target.value) }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          >
                            {[2, 3, 4, 5].map(n => (
                              <option key={n} value={n}>{n} days per week</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}