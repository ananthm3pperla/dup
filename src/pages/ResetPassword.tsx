import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Building2, Lock, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

// Form validation schema
const resetSchema = z.object({
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

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmPasswordReset, error: authError } = useAuth();
  
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResetFormData>({
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ResetFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  // Extract oobCode from URL on component mount
  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (code) {
      setOobCode(code);
    } else {
      setError('Invalid or expired password reset link');
    }
  }, [searchParams]);

  // Calculate password strength
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name as keyof ResetFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    try {
      resetSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<ResetFormData> = {};
        err.errors.forEach(error => {
          const path = error.path[0] as keyof ResetFormData;
          errors[path] = error.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm() || !oobCode) return;
    
    setIsSubmitting(true);
    try {
      await confirmPasswordReset(oobCode, formData.password);
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Building2 className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create a strong, secure password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          {isSuccess ? (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Password successfully reset!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Your password has been changed. You will be redirected to the login page in a few seconds.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <Link
                        to="/login"
                        className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                      >
                        Go to login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
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
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    New password
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
                  <button
                    type="submit"
                    disabled={isSubmitting || !oobCode}
                    className="flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting password...
                      </span>
                    ) : (
                      'Reset password'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="font-medium text-primary hover:text-primary-light flex items-center justify-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}