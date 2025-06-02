import React, { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui";
import CheckInDialog from "./CheckInDialog";

interface CheckInButtonProps {
  className?: string;
}

export default function CheckInButton({ className }: CheckInButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        size="lg"
        onClick={() => setIsDialogOpen(true)}
        leftIcon={<Camera className="h-4 w-4" />}
        className={`text-white ${className}`}
      >
        Check In
      </Button>

      <CheckInDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
