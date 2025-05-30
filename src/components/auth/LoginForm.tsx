import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { z } from 'zod';
import { Link } from 'react-router-dom';

interface LoginFormProps {
  onSubmit: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export default function LoginForm({ onSubmit, isSubmitting, error }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form validation
  const validateForm = () => {
    const schema = z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required')
    });

    try {
      schema.parse(formData);
      setFormErrors({});
      return true;
    } catch (err) {
      const errors: { email?: string; password?: string } = {};
      if (err instanceof z.ZodError) {
        err.errors.forEach(error => {
          const field = error.path[0] as 'email' | 'password';
          errors[field] = error.message;
        });
      }
      setFormErrors(errors);
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    await onSubmit(formData.email, formData.password, rememberMe);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <Alert 
          variant="error" 
          title="Sign in failed"
          className="mb-4"
        >
          {error}
        </Alert>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={`block w-full appearance-none rounded-md border ${
              formErrors.email ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            } px-3 py-2 pl-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white`}
            placeholder="you@example.com"
          />
        </div>
        {formErrors.email && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Password
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className={`block w-full appearance-none rounded-md border ${
              formErrors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
            } px-3 py-2 pl-10 pr-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white`}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {formErrors.password && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-light dark:hover:text-primary-light">
            Forgot your password?
          </Link>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full flex justify-center items-center"
          leftIcon={<LogIn className="h-4 w-4" />}
        >
          Sign in
        </Button>
      </div>
    </form>
  );
}