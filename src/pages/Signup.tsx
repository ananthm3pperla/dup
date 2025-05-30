import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Mail, Lock, AlertCircle, ChevronLeft, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { useForm } from '@/lib/hooks/useForm';
import { z } from 'zod';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, error: authError } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  // Form validation schema
  const signupSchema = z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z.string()
      .email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

  // Use the form hook
  const { 
    values: formData, 
    errors: formErrors, 
    isSubmitting, 
    submitError: error, 
    handleChange: handleInputChange, 
    handleSubmit 
  } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      await signUp(values.email, values.password, values.name);
      navigate('/onboarding');
    }
  });

  // Calculate password strength
  React.useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building2 className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join Hi-Bridge to manage your team's hybrid work schedule
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {(error || authError) && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error || (authError instanceof Error ? authError.message : 'Authentication error')}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`block w-full appearance-none rounded-md border ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                  placeholder="John Doe"
                />
              </div>
              {formErrors.name && (
                <p className="mt-2 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Work email
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                  placeholder="you@company.com"
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`block w-full appearance-none rounded-md border ${
                    formErrors.password ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 pl-10 pr-10 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
              )}
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-600">Password strength:</p>
                    <p className="text-xs font-medium" style={{ 
                      color: passwordStrength === 0 ? 'rgb(239 68 68)' : 
                            passwordStrength === 1 ? 'rgb(234 179 8)' : 
                            passwordStrength === 2 ? 'rgb(234 179 8)' : 
                            passwordStrength === 3 ? 'rgb(59 130 246)' : 
                            'rgb(16 185 129)'
                    }}>
                      {passwordStrength === 0 ? 'Very weak' : 
                      passwordStrength === 1 ? 'Weak' : 
                      passwordStrength === 2 ? 'Fair' : 
                      passwordStrength === 3 ? 'Good' : 
                      'Strong'}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" 
                         style={{
                           width: `${(passwordStrength / 4) * 100}%`,
                           backgroundColor: passwordStrength === 0 ? 'rgb(239 68 68)' : 
                                          passwordStrength === 1 ? 'rgb(234 179 8)' : 
                                          passwordStrength === 2 ? 'rgb(234 179 8)' : 
                                          passwordStrength === 3 ? 'rgb(59 130 246)' : 
                                          'rgb(16 185 129)'
                         }}>
                    </div>
                  </div>
                </div>
              )}
              
              <ul className="mt-2 text-xs text-gray-500 space-y-1">
                <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                  At least one uppercase letter
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  At least one number
                </li>
                <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  At least one special character
                </li>
              </ul>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`block w-full appearance-none rounded-md border ${
                    formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 pl-10 placeholder-gray-400 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                  placeholder="••••••••"
                />
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full"
              >
                Create account
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Already have an account?</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <Link 
                to="/login" 
                className="font-medium text-primary hover:text-primary-light flex items-center justify-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to login</span>
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary hover:text-primary-light">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:text-primary-light">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}