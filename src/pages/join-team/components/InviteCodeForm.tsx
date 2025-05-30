import React from 'react';
import { Users, ArrowRight, Link as LinkIcon } from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { Link } from 'react-router-dom';

interface InviteCodeFormProps {
  inviteCode: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  error?: string;
  isSubmitting: boolean;
  isLoggedIn: boolean;
}

export default function InviteCodeForm({
  inviteCode,
  onChange,
  onSubmit,
  error,
  isSubmitting,
  isLoggedIn,
}: InviteCodeFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <Alert 
          variant="error" 
          title="Invalid Invite Code"
          className="mb-4"
        >
          {error}
        </Alert>
      )}
      
      <div>
        <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Team Invite Code
        </label>
        <div className="mt-1 relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Users className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="inviteCode"
            name="inviteCode"
            type="text"
            value={inviteCode}
            onChange={onChange}
            className={`block w-full pl-10 rounded-md shadow-sm text-sm ${
              error 
                ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
            } dark:bg-gray-700 dark:text-white`}
            placeholder="Enter team invite code"
            required
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <LinkIcon className="h-3 w-3" />
          Paste the full invite link or just the code
        </p>
      </div>

      <div className="flex flex-col space-y-4">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          {isLoggedIn ? "Join Team" : "Continue"}
        </Button>
        
        {!isLoggedIn && (
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light"
            >
              Already have an account? Sign in
            </Link>
          </div>
        )}
        
        <div className="text-center">
          <Link
            to="/team/create"
            className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Don't have an invite code? Create a new team instead
          </Link>
        </div>
      </div>
    </form>
  );
}