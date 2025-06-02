import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordRequirement {
  regex: RegExp;
  text: string;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export default function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  // Define password requirements
  const requirements: PasswordRequirement[] = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "At least one uppercase letter" },
    { regex: /[0-9]/, text: "At least one number" },
    { regex: /[^A-Za-z0-9]/, text: "At least one special character" },
  ];

  // Calculate password strength (0-4)
  const strength = useMemo(() => {
    return requirements.reduce((count, requirement) => {
      return requirement.regex.test(password) ? count + 1 : count;
    }, 0);
  }, [password, requirements]);

  // Get strength label and color
  const getStrengthInfo = () => {
    if (strength === 0) return { label: "Very weak", color: "rgb(239 68 68)" };
    if (strength === 1) return { label: "Weak", color: "rgb(234 179 8)" };
    if (strength === 2) return { label: "Fair", color: "rgb(234 179 8)" };
    if (strength === 3) return { label: "Good", color: "rgb(59 130 246)" };
    return { label: "Strong", color: "rgb(16 185 129)" };
  };

  const { label, color } = getStrengthInfo();

  // Don't render anything if password is empty
  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength meter */}
      {password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Password strength:
            </p>
            <p className="text-xs font-medium" style={{ color }}>
              {label}
            </p>
          </div>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(strength / 4) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      )}

      {/* Requirements list */}
      <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
        {requirements.map((requirement, index) => {
          const isMet = requirement.regex.test(password);
          return (
            <li
              key={index}
              className={cn(
                "flex items-center gap-1.5",
                isMet ? "text-green-600 dark:text-green-400" : "",
              )}
            >
              {isMet ? (
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
              )}
              {requirement.text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
