import React from "react";
import StatusDisplay from "./ui/StatusDisplay";
import { Button } from "@/components/ui";

interface EmptyStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  message,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <StatusDisplay
      type="empty"
      title={title}
      message={message}
      icon={icon}
      className="min-h-[200px] bg-card-hover rounded-lg border border-default/20"
    >
      {action && (
        <Button onClick={action.onClick} className="mx-auto mt-4">
          {action.label}
        </Button>
      )}
    </StatusDisplay>
  );
}
