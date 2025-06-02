import React, { useState } from "react";
import { Key, Mail, AlertTriangle } from "lucide-react";
import { Card, Button, Alert, Input } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { z } from "zod";
import { passwordSchema } from "@/lib/security";
import PasswordStrengthIndicator from "@/components/ui/PasswordStrengthIndicator";
import { isDemoMode } from "@/lib/demo";

export default function AccountSettings() {
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // In demo mode, just show success message
    if (isDemoMode()) {
      toast.success("Password updated successfully (Demo Mode)");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      return;
    }

    // Validate passwords
    try {
      // Validate new password
      passwordSchema.parse(newPassword);

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords don't match");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid password");
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updatePassword(newPassword);
      toast.success("Password updated successfully");

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error updating password:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
      toast.error("Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    // In demo mode, just show a message
    if (isDemoMode()) {
      toast.error("Account deletion is not available in demo mode");
      setShowDeleteConfirm(false);
      setDeleteConfirmText("");
      return;
    }

    // This would be implemented with a call to the backend
    toast.error("Account deletion is not implemented in this demo");
    setShowDeleteConfirm(false);
    setDeleteConfirmText("");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-4">
          Account Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="mt-1 flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="block w-full pl-10 pr-12 py-2 rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    Verified
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your email address cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Account ID
            </label>
            <div className="mt-1">
              <input
                type="text"
                value={user?.id || ""}
                disabled
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your unique account identifier
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-4">
          Change Password
        </h3>

        {error && (
          <Alert
            variant="error"
            title="Password Update Failed"
            className="mb-4"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type={showPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leftIcon={<Key className="h-5 w-5" />}
            required
          />

          <Input
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Key className="h-5 w-5" />}
            required
          />

          <PasswordStrengthIndicator password={newPassword} className="mt-2" />

          <Input
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Key className="h-5 w-5" />}
            required
          />

          <div className="flex items-center">
            <input
              id="show-password"
              name="show-password"
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="show-password"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Show passwords
            </label>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={
                isSubmitting ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-default mb-4">Danger Zone</h3>

        {showDeleteConfirm ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-300" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Delete Account Confirmation
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-red-700 dark:text-red-200">
                    This action cannot be undone. All your data will be
                    permanently deleted.
                  </p>
                  <div className="mt-3">
                    <label
                      htmlFor="confirm-delete"
                      className="block text-sm font-medium text-red-700 dark:text-red-200"
                    >
                      Type "DELETE" to confirm
                    </label>
                    <input
                      type="text"
                      id="confirm-delete"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="mt-1 block w-full rounded-md border-red-300 dark:border-red-700 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm dark:bg-red-900/30 dark:text-white"
                    />
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border-red-300 dark:border-red-700"
                      disabled={deleteConfirmText !== "DELETE"}
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Deleting your account will remove all of your data from our
              systems. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border-red-300 dark:border-red-700"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
