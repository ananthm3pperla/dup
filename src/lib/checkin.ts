/**
 * Check-in functionality for Hi-Bridge
 * Handles office check-ins with photo verification
 */

import { checkinAPI } from "./supabase";
import { isDemoMode } from "./demo";

export async function submitCheckIn(checkInData: {
  photo?: File;
  location?: { latitude: number; longitude: number };
  notes?: string;
}) {
  try {
    if (isDemoMode()) {
      // Return mock data for demo mode
      return {
        id: `demo-checkin-${Date.now()}`,
        user_id: "demo-user",
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0],
        photo_url: checkInData.photo
          ? URL.createObjectURL(checkInData.photo)
          : null,
        location: checkInData.location,
        notes: checkInData.notes,
        status: "approved",
        points_earned: 10,
        created_at: new Date().toISOString(),
      };
    }

    // Create FormData for file upload
    const formData = new FormData();
    if (checkInData.photo) {
      formData.append("photo", checkInData.photo);
    }
    if (checkInData.location) {
      formData.append("location", JSON.stringify(checkInData.location));
    }
    if (checkInData.notes) {
      formData.append("notes", checkInData.notes);
    }

    const result = await checkinAPI.submitCheckin(formData);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error("Error submitting check-in:", error);
    throw error;
  }
}

export async function getCheckInHistory(startDate?: string, endDate?: string) {
  try {
    if (isDemoMode()) {
      // Return mock check-in history for demo mode
      const today = new Date();
      const mockCheckins = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        if (i % 2 === 0) {
          // Every other day
          mockCheckins.push({
            id: `demo-checkin-${i}`,
            user_id: "demo-user",
            date: date.toISOString().split("T")[0],
            time: "09:30:00",
            photo_url: null,
            location: { latitude: 32.7767, longitude: -96.797 }, // Dallas coordinates
            notes: i === 0 ? "Great day at the office!" : null,
            status: "approved",
            points_earned: 10,
            created_at: date.toISOString(),
          });
        }
      }

      return mockCheckins;
    }

    const result = await checkinAPI.getCheckinHistory(
      startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      endDate || new Date().toISOString().split("T")[0],
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data || [];
  } catch (error) {
    console.error("Error getting check-in history:", error);
    throw error;
  }
}

export async function verifyCheckIn(
  checkinId: string,
  approved: boolean,
  verifierId: string,
  rejectionReason?: string,
) {
  try {
    // If in demo mode, return mock data
    if (isDemoMode()) {
      return {
        id: checkinId,
        status: approved ? "approved" : "rejected",
        verified_by: verifierId,
        verified_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      };
    }

    // In production, this would typically be done through an admin API
    const response = await fetch(`/api/checkins/${checkinId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approved,
        verifierId,
        rejectionReason,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to verify check-in");
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying check-in:", error);
    throw error;
  }
}

export async function getTeamCheckInSettings(teamId: string) {
  try {
    // If in demo mode, return mock data
    if (isDemoMode()) {
      return {
        team_id: teamId,
        selfie_required: true,
        location_verification: true,
        auto_approval: false,
        retention_days: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const response = await fetch(`/api/teams/${teamId}/checkin-settings`);

    if (!response.ok) {
      throw new Error("Failed to get check-in settings");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting check-in settings:", error);
    throw error;
  }
}

export async function updateTeamCheckInSettings(
  teamId: string,
  settings: {
    selfie_required?: boolean;
    location_verification?: boolean;
    auto_approval?: boolean;
    retention_days?: number;
  },
) {
  try {
    if (isDemoMode()) {
      return {
        team_id: teamId,
        ...settings,
        updated_at: new Date().toISOString(),
      };
    }

    const response = await fetch(`/api/teams/${teamId}/checkin-settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error("Failed to update check-in settings");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating check-in settings:", error);
    throw error;
  }
}
