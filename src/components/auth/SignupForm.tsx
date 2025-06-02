import React, { useState, useEffect } from "react";
import { User, Mail, Lock } from "lucide-react";
import { Button, Alert, PasswordStrengthIndicator } from "@/components/ui";
import { z } from "zod";

interface SignupFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export default function SignupForm({
  onSubmit,
  isSubmitting,
  error,
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;

    if (formData.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(formData.password)) strength += 1;
    if (/[0-9]/.test(formData.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1;

    setPasswordStrength(strength);
  }, [formData.password]);

  // Form validation
  const validateForm = () => {
    const schema = z
      .object({
        name: z
          .string()
          .min(2, "Name must be at least 2 characters")
          .max(100, "Name cannot exceed 100 characters")
          .regex(
            /^[a-zA-Z\s\-']+$/,
            "Name can only contain letters, spaces, hyphens, and apostrophes",
          ),
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
          .regex(/[0-9]/, "Password must contain at least one number")
          .regex(
            /[^A-Za-z0-9]/,
            "Password must contain at least one special character",
          ),
        confirmPassword: z.string(),
        acceptTerms: z.boolean().refine((val) => val === true, {
          message: "You must accept the terms and conditions",
        }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });

    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: { [key: string]: string } = {};
        err.errors.forEach((error) => {
          const path = error.path[0] as keyof typeof formData;
          errors[path] = error.message;
        });
        setErrors(errors);
      }
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof formData];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData.name, formData.email, formData.password);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="error" title="Sign up failed" className="mb-4">
          {error}
        </Alert>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Full name
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <User
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
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
              errors.name
                ? "border-red-300 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } px-3 py-2 pl-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white`}
            placeholder="John Doe"
          />
        </div>
        {errors.name && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Work email
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
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
              errors.email
                ? "border-red-300 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } px-3 py-2 pl-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white`}
            placeholder="you@company.com"
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
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
              errors.password
                ? "border-red-300 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } px-3 py-2 pl-10 pr-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white`}
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg\"
                className="h-5 w-5 text-gray-400 dark:text-gray-500\"
                fill="none\"
                viewBox="0 0 24 24\"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round\"
                  strokeLinejoin="round\"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        <PasswordStrengthIndicator
          password={formData.password}
          className="mt-2"
        />

        {errors.password && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Confirm password
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock
              className="h-5 w-5 text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            />
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
              errors.confirmPassword
                ? "border-red-300 dark:border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } px-3 py-2 pl-10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white`}
            placeholder="••••••••"
          />
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.confirmPassword}
          </p>
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
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div className="ml-3 text-sm">
          <label
            htmlFor="acceptTerms"
            className="text-gray-600 dark:text-gray-400"
          >
            I agree to the{" "}
            <a
              href="/terms"
              className="text-primary hover:text-primary-dark dark:hover:text-primary-light"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="text-primary hover:text-primary-dark dark:hover:text-primary-light"
            >
              Privacy Policy
            </a>
          </label>
        </div>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors.acceptTerms}
        </p>
      )}

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
  );
}
