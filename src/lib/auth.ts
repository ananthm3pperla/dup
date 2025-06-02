import { database } from "./database";

/**
 * Hash a password using Web Crypto API (browser-compatible)
 * Note: In production, password hashing should be done server-side
 */
export async function hashPassword(password: string): Promise<string> {
  // For demo purposes only - real apps should hash passwords server-side
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a password against its hash
 * Note: In production, password verification should be done server-side
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  // For demo purposes only - real apps should verify passwords server-side
  const currentHash = await hashPassword(password);
  return currentHash === hashedPassword;
}

/**
 * Generate a random token for password reset or email verification
 */
export function generateToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  try {
    const sessionData = localStorage.getItem("hibridge_session");
    if (!sessionData) {
      return null;
    }

    const { userId } = JSON.parse(sessionData);
    const userData = await database.get(`user_by_id:${userId}`);
    return userData;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const sessionData = localStorage.getItem("hibridge_session");
  return !!sessionData;
}

/**
 * Clear user session
 */
export function clearSession(): void {
  localStorage.removeItem("hibridge_session");
}

/**
 * Mock team management functions
 */
export async function createTeam(teamData: {
  name: string;
  description?: string;
  managerId: string;
}) {
  const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const team = {
    id: teamId,
    name: teamData.name,
    description: teamData.description || "",
    manager_id: teamData.managerId,
    members: [teamData.managerId],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await database.set(`team:${teamId}`, team);
  return team;
}

export async function joinTeam(userId: string, teamId: string) {
  const team = await database.get(`team:${teamId}`);
  if (!team) {
    throw new Error("Team not found");
  }

  if (!team.members.includes(userId)) {
    team.members.push(userId);
    team.updated_at = new Date().toISOString();
    await database.set(`team:${teamId}`, team);
  }

  return team;
}

export async function getUserTeams(userId: string) {
  try {
    const teamKeys = await database.list();
    const userTeams = [];

    for (const key of teamKeys) {
      if (key.startsWith("team:")) {
        const team = await database.get(key);
        if (team && team.members && team.members.includes(userId)) {
          userTeams.push(team);
        }
      }
    }

    return userTeams;
  } catch (error) {
    console.error("Error getting user teams:", error);
    return [];
  }
}
