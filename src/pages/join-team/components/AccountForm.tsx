import React, { useEffect, useState } from 'react';
import { User, Mail, Lock, Check, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { PasswordStrengthIndicator } from '@/components/auth';

interface AccountFormProps {
  formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms?: boolean;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackClick: () => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  showPassword: boolean;
  toggleShowPassword: () => void;
}

export default function AccountForm({
  formData,
  onChange,
  onBlur,
  onSubmit,
  onBackClick,
  errors,
  isSubmitting,
  showPassword,
  toggleShowPassword,
}: AccountFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Full Name
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full pl-10 rounded-md shadow-sm text-sm ${
              errors.name 
                ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
            } dark:bg-gray-700 dark:text-white`}
            placeholder="John Doe"
            required
          />
        </div>
        {errors.name && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email Address
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full pl-10 rounded-md shadow-sm text-sm ${
              errors.email
                ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
            } dark:bg-gray-700 dark:text-white`}
            placeholder="you@example.com"
            required
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full pl-10 pr-10 rounded-md shadow-sm text-sm ${
              errors.password
                ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
            } dark:bg-gray-700 dark:text-white`}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={toggleShowPassword}
          >
            {showPassword ? (
              <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg\" className="h-5 w-5 text-gray-400 dark:text-gray-500\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
                <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {errors.password && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
        )}

        <PasswordStrengthIndicator password={formData.password} />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={onChange}
            onBlur={onBlur}
            className={`block w-full pl-10 rounded-md shadow-sm text-sm ${
              errors.confirmPassword
                ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-primary'
            } dark:bg-gray-700 dark:text-white`}
            placeholder="••••••••"
            required
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Privacy Policy Checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={onChange}
            onBlur={onBlur}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="acceptTerms" className="text-gray-600 dark:text-gray-400">
            I agree to the <a href="/terms" className="text-primary hover:text-primary-dark dark:hover:text-primary-light">Terms of Service</a> and <a href="/privacy" className="text-primary hover:text-primary-dark">Privacy Policy</a>
          </label>
        </div>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600 dark:text-red-400">{errors.acceptTerms}</p>
      )}

      <div className="flex flex-col space-y-4">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full"
          leftIcon={<Check className="h-4 w-4" />}
        >
          Create Account & Join Team
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBackClick}
          className="w-full"
          disabled={isSubmitting}
        >
          Back to Invite Code
        </Button>
      </div>
    </form>
  );
}