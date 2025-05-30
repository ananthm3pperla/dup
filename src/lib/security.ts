import { z } from 'zod';

// Password validation schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Validate token (used for email verification, password reset)
export function validateToken(token: string): boolean {
  // Basic JWT format validation
  return /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token);
}

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Generate a secure random token for various security purposes
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Check password strength and return a score from 0-4
export function checkPasswordStrength(password: string): number {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  
  // Uppercase check
  if (/[A-Z]/.test(password)) score += 1;
  
  // Number check
  if (/[0-9]/.test(password)) score += 1;
  
  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  return score;
}

// Get password strength label based on score
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0: return 'Very weak';
    case 1: return 'Weak';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Strong';
    default: return 'Unknown';
  }
}

// Get password strength color based on score
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0: return 'rgb(239 68 68)'; // red
    case 1: return 'rgb(234 179 8)'; // yellow
    case 2: return 'rgb(234 179 8)'; // yellow
    case 3: return 'rgb(59 130 246)'; // blue
    case 4: return 'rgb(16 185 129)'; // green
    default: return 'rgb(156 163 175)'; // gray
  }
}

// Detect suspicious activity based on IP, device, etc.
export function detectSuspiciousActivity(
  currentIP: string,
  knownIPs: string[],
  currentDevice: string,
  knownDevices: string[]
): { suspicious: boolean; reason?: string } {
  // Check if IP is known
  const isKnownIP = knownIPs.includes(currentIP);
  
  // Check if device is known
  const isKnownDevice = knownDevices.includes(currentDevice);
  
  // If both IP and device are unknown, consider it suspicious
  if (!isKnownIP && !isKnownDevice) {
    return { 
      suspicious: true, 
      reason: 'Login from new location and device' 
    };
  }
  
  // If only IP is unknown, it might be suspicious
  if (!isKnownIP) {
    return { 
      suspicious: true, 
      reason: 'Login from new location' 
    };
  }
  
  // Otherwise, not suspicious
  return { suspicious: false };
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}