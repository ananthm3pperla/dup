
interface PulseCheck {
  id: string;
  userId: string;
  mood: number;
  productivity: number;
  collaboration: number;
  satisfaction: number;
  feedback?: string;
  date: string;
  timestamp: string;
}

class PulseService {
  async submitPulseCheck(data: {
    mood: number;
    productivity: number;
    collaboration: number;
    satisfaction: number;
    feedback?: string;
  }): Promise<PulseCheck> {
    const response = await fetch('/api/pulse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit pulse check');
    }

    return response.json();
  }

  async getTodaysPulse(): Promise<PulseCheck | null> {
    const response = await fetch('/api/pulse/today');

    if (!response.ok) {
      throw new Error('Failed to get pulse data');
    }

    return response.json();
  }
}

export const pulseService = new PulseService();
export type { PulseCheck };
