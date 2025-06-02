import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui";
import CheckInCamera from "./CheckInCamera";
import { useTeam } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { submitCheckIn } from "@/lib/checkin";
import { toast } from "sonner";
import FocusLock from "react-focus-lock";

interface CheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInDialog({ isOpen, onClose }: CheckInDialogProps) {
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const [isCapturing, setIsCapturing] = useState(false);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Refs for accessibility
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Save the currently focused element when dialog opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
    }
  }, [isOpen]);

  // Focus management - focus the close button when dialog opens
  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 100);
    }

    // Return focus to the previously focused element when dialog closes
    return () => {
      if (
        !isOpen &&
        previousActiveElement.current &&
        "focus" in previousActiveElement.current
      ) {
        (previousActiveElement.current as HTMLElement).focus();
      }
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting && !success) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [isOpen, isSubmitting, success, onClose]);

  const handleCapture = async (photoBlob: Blob) => {
    setPhoto(photoBlob);
    setIsCapturing(false);

    // Get location if enabled
    if (currentTeam?.checkin_settings?.location_verification) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          },
        );
        setLocation(position);
      } catch (err) {
        console.error("Error getting location:", err);
        toast.error(
          "Unable to verify location. Please enable location services.",
        );
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !currentTeam || !photo) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitCheckIn(user.id, currentTeam.id, photo, location?.coords);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setPhoto(null);
        setLocation(null);
      }, 2000);
    } catch (err) {
      console.error("Check-in error:", err);
      setError("Failed to submit check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting && !success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <FocusLock returnFocus={true}>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-dialog-title"
      >
        <div className="min-h-screen px-4 text-center flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md sm:max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6"
          >
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 sm:py-8"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-7 w-7 sm:h-8 sm:w-8 text-success" />
                </div>
                <h3
                  className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2"
                  id="checkin-dialog-title"
                >
                  Check-in Successful!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your office presence has been recorded.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                      <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div>
                      <h3
                        className="text-base sm:text-xl font-medium text-gray-900 dark:text-gray-100"
                        id="checkin-dialog-title"
                      >
                        My Office Check-in
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Take a quick selfie to verify your office presence
                      </p>
                    </div>
                  </div>
                  <button
                    ref={initialFocusRef}
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg p-1"
                    disabled={isSubmitting}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-error/10 text-error rounded-lg text-xs sm:text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4 sm:space-y-6">
                  {isCapturing ? (
                    <CheckInCamera
                      onCapture={handleCapture}
                      onCancel={() => setIsCapturing(false)}
                    />
                  ) : photo ? (
                    <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt="Check-in"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(URL.createObjectURL(photo));
                          setPhoto(null);
                          setIsCapturing(true);
                        }}
                        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Retake photo"
                      >
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <Camera className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 text-center px-4">
                        Take a selfie to verify your presence in the office
                      </p>
                      <Button
                        onClick={() => setIsCapturing(true)}
                        leftIcon={<Camera className="h-4 w-4" />}
                        size="sm"
                      >
                        Take Photo
                      </Button>
                    </div>
                  )}

                  {location && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-success">
                      <MapPin className="h-4 w-4" />
                      <span>Location verified</span>
                      <Check className="h-4 w-4" />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!photo || isSubmitting}
                      isLoading={isSubmitting}
                      size="sm"
                    >
                      Submit Check-in
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </FocusLock>
  );
}
