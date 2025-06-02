import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Check,
  Loader,
  AlertCircle,
} from "lucide-react";
import { Button, Card, Alert } from "@/components/ui";
import { toast } from "sonner";

interface CalendarIntegrationProps {
  onConnect: (provider: "google" | "microsoft") => void;
  isConnected: boolean;
}

// Mock calendar events for the demo
export const MOCK_CALENDAR_EVENTS = [
  {
    id: "1",
    title: "Team Standup",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 30, 0, 0)),
    location: "Google Meet",
    attendees: 6,
    description: "Daily team sync to discuss progress and blockers.",
  },
  {
    id: "2",
    title: "Product Review",
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(14, 0, 0, 0)),
    location: "Conference Room A / Google Meet",
    attendees: 8,
    description: "Review latest product features and provide feedback.",
  },
  {
    id: "3",
    title: "1:1 with Manager",
    start: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
      11,
      0,
      0,
      0,
    ),
    end: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
      11,
      30,
      0,
      0,
    ),
    location: "Google Meet",
    attendees: 2,
    description: "Weekly check-in to discuss progress, goals, and challenges.",
  },
  {
    id: "4",
    title: "Engineering All-Hands",
    start: new Date(new Date().setDate(new Date().getDate() + 2)).setHours(
      15,
      0,
      0,
      0,
    ),
    end: new Date(new Date().setDate(new Date().getDate() + 2)).setHours(
      16,
      0,
      0,
      0,
    ),
    location: "Main Auditorium / Google Meet",
    attendees: 35,
    description:
      "Monthly engineering department meeting to discuss company updates and technical roadmap.",
  },
];

export default function CalendarIntegration({
  onConnect,
  isConnected,
}: CalendarIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState<
    "google" | "microsoft" | null
  >(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = async (provider: "google" | "microsoft") => {
    if (isConnected) return;

    setIsConnecting(provider);
    setConnectionError(null);

    try {
      // In a real implementation, this would initiate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network request
      onConnect(provider);
      toast.success(
        `Connected to ${provider === "google" ? "Google" : "Microsoft"} Calendar`,
      );
    } catch (error) {
      console.error(`Error connecting to ${provider} calendar:`, error);
      setConnectionError(
        `Failed to connect to ${provider} Calendar. ${error instanceof Error ? error.message : "Please check your permissions and try again."}`,
      );
      toast.error(`Failed to connect to ${provider} Calendar`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleRetry = () => {
    setConnectionError(null);
  };

  return (
    <Card className="p-4 border-l-4 border-l-primary">
      {connectionError && (
        <Alert
          variant="error"
          title="Connection Error"
          className="mb-4"
          onClose={() => setConnectionError(null)}
        >
          <p>{connectionError}</p>
          <Button
            className="mt-2"
            size="sm"
            variant="outline"
            onClick={handleRetry}
          >
            Try Again
          </Button>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <CalendarIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {isConnected ? "Calendar Connected" : "Connect your Calendar"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected
                ? "Your meetings will appear alongside your schedule"
                : "Sync with your calendar to see meetings alongside your work schedule"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          {!isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect("google")}
                disabled={!!isConnecting}
                isBusy={isConnecting === "google"}
                className={isConnecting === "google" ? "opacity-80" : ""}
              >
                {isConnecting === "google" ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    className="mr-2"
                  >
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      />
                    </g>
                  </svg>
                )}
                Google Calendar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect("microsoft")}
                disabled={!!isConnecting}
                isBusy={isConnecting === "microsoft"}
                className={isConnecting === "microsoft" ? "opacity-80" : ""}
              >
                {isConnecting === "microsoft" ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 21 21"
                    className="mr-2"
                  >
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                )}
                Microsoft Calendar
              </Button>
            </>
          ) : (
            <div className="flex items-center text-success gap-1">
              <Check className="h-5 w-5" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium mb-2">About Calendar Integration</h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-5">
          <li>
            Calendar integration shows your meetings alongside your work
            schedule
          </li>
          <li>
            We only access your meeting times, titles, and attendee counts
          </li>
          <li>Your calendar data is never stored on our servers</li>
          <li>You can disconnect your calendar at any time</li>
        </ul>
      </div>
    </Card>
  );
}
