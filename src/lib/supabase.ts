/**
 * Session management utilities for Replit backend
 */
export class SessionManager {
  private static instance: SessionManager;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async checkSession(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  startSessionMonitoring(onSessionExpired: () => void): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      const isValid = await this.checkSession();
      if (!isValid) {
        onSessionExpired();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }
}

export const sessionManager = SessionManager.getInstance();