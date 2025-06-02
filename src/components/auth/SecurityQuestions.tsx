import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, X, Check, AlertTriangle } from "lucide-react";
import { Button, Alert } from "@/components/ui";

interface SecurityQuestionsProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (answers: Record<string, string>) => Promise<boolean>;
  questions: { id: string; question: string }[];
}

export default function SecurityQuestions({
  isOpen,
  onClose,
  onVerify,
  questions,
}: SecurityQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setAnswers({});
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Handle input change
  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Clear error
    if (error) setError(null);
  };

  // Handle submit
  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredQuestions = questions.filter(
      (q) => !answers[q.id] || answers[q.id].trim() === "",
    );

    if (unansweredQuestions.length > 0) {
      setError("Please answer all security questions");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const isValid = await onVerify(answers);

      if (isValid) {
        setSuccess(true);
        // Close after a delay
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError("One or more answers are incorrect. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying answers:", err);
      setError(err instanceof Error ? err.message : "Failed to verify answers");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-6 mx-4"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          disabled={isSubmitting}
        >
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6">
          <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-medium text-gray-900 dark:text-gray-100">
              Security Verification
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Please answer your security questions to verify your identity
            </p>
          </div>
        </div>

        {/* Success state */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6"
          >
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Verification Successful
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your identity has been successfully verified.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Error message */}
            {error && (
              <Alert
                variant="error"
                title="Verification Failed"
                className="mb-4"
                icon={<AlertTriangle className="h-5 w-5" />}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            {/* Questions */}
            <div className="space-y-4 mb-6">
              {questions.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {q.question}
                  </label>
                  <input
                    type="text"
                    value={answers[q.id] || ""}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
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
                isLoading={isSubmitting}
                disabled={isSubmitting}
                size="sm"
              >
                Verify
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
