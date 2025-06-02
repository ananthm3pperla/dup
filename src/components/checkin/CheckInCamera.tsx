import React, { useRef, useState, useCallback } from "react";
import {
  Camera,
  X,
  Image as ImageIcon,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";
import { validateCheckInPhoto } from "@/lib/faceRecognition";

interface CheckInCameraProps {
  onCapture: (photo: Blob) => void;
  onCancel: () => void;
}

export default function CheckInCamera({
  onCapture,
  onCancel,
}: CheckInCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    confidence: number;
  } | null>(null);

  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Unable to access camera. Please ensure camera permissions are granted.",
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);

      // Clear video source
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const takePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0);

        // Convert to blob and validate
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setPhoto(URL.createObjectURL(blob));

              // Validate the photo
              setIsValidating(true);
              validateCheckInPhoto(blob)
                .then((result) => {
                  setValidationResult({
                    isValid: result.isValid,
                    message: result.message,
                    confidence: result.confidence,
                  });

                  if (result.isValid) {
                    // Only capture if validation passes
                    onCapture(blob);
                  }
                })
                .catch((err) => {
                  setError(`Validation error: ${err.message}`);
                })
                .finally(() => {
                  setIsValidating(false);
                });
              stopCamera();
            }
          },
          "image/jpeg",
          0.8,
        );
      }
    }
  }, [onCapture, stopCamera]);

  const retakePhoto = useCallback(() => {
    if (photo) {
      URL.revokeObjectURL(photo);
      setPhoto(null);
      setValidationResult(null);
    }
    startCamera();
  }, [photo, startCamera]);

  // Start camera when component mounts
  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (photo) {
        URL.revokeObjectURL(photo);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="bg-error/10 rounded-lg p-6 text-center">
        <p className="text-error mb-4">{error}</p>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {!photo ? (
        <motion.div
          key="camera"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-lg overflow-hidden bg-black aspect-video"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="bg-white/10 hover:bg-white/20 border-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
              <Button
                onClick={takePhoto}
                className="bg-white text-black hover:bg-white/90"
                size="lg"
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-lg overflow-hidden bg-black aspect-video flex flex-col"
        >
          <img
            src={photo}
            alt="Check-in photo"
            className="w-full h-full object-cover"
          />
          {isValidating && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Validating photo...</p>
              </div>
            </div>
          )}
          {validationResult && (
            <div
              className={`absolute bottom-0 left-0 right-0 p-3 ${
                validationResult.isValid ? "bg-green-500/80" : "bg-red-500/80"
              }`}
            >
              <div className="flex items-center gap-2 text-white">
                {validationResult.isValid ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <p>{validationResult.message}</p>
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="bg-white/10 hover:bg-white/20 border-white/20"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => onCapture(photo)}
                className="bg-white text-black hover:bg-white/90"
                size="lg"
              >
                <ImageIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
