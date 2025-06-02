interface Schedule {
  id: string;
  userId: string;
  date: string;
  location: "office" | "remote";
  isPlanned: boolean;
  createdAt: string;
}

class ScheduleService {
  async updateSchedule(
    date: string,
    location: "office" | "remote",
    isPlanned: boolean = true,
  ): Promise<Schedule> {
    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, location, isPlanned }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update schedule");
    }

    return response.json();
  }

  async getSchedule(startDate: string, endDate: string): Promise<Schedule[]> {
    const response = await fetch(
      `/api/schedule?startDate=${startDate}&endDate=${endDate}`,
    );

    if (!response.ok) {
      throw new Error("Failed to get schedule data");
    }

    return response.json();
  }
}

export const scheduleService = new ScheduleService();
export type { Schedule };
