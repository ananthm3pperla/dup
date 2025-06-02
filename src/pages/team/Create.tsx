import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  Clock,
  AlertCircle,
  Info,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { z } from "zod";
import { Button, Card, Alert, Tooltip } from "@/components/ui";
import { motion } from "framer-motion";

// Form validation schema
const teamSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name cannot exceed 50 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  rtoPolicy: z.object({
    required_days: z
      .number()
      .min(0, "Required days cannot be negative")
      .max(5, "Required days cannot exceed 5"),
    hasCoreHours: z.boolean(),
    core_hours: z
      .object({
        start: z.string(),
        end: z.string(),
      })
      .optional(),
  }),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function TeamCreate() {
  const navigate = useNavigate();
  const { createTeam, error: teamError, loading } = useTeam();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "",
    rtoPolicy: {
      required_days: 2,
      hasCoreHours: true,
      core_hours: {
        start: "10:00",
        end: "16:00",
      },
    },
  });
  const [formErrors, setFormErrors] = useState<Partial<TeamFormData>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("rtoPolicy.")) {
      const policyField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        rtoPolicy: {
          ...prev.rtoPolicy,
          [policyField]:
            name === "rtoPolicy.required_days" ? parseInt(value) : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name as keyof TeamFormData];
      return newErrors;
    });
  };

  const handleCoreHoursToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasCoreHours = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      rtoPolicy: {
        ...prev.rtoPolicy,
        hasCoreHours,
        core_hours: hasCoreHours ? { start: "10:00", end: "16:00" } : undefined,
      },
    }));
  };

  const validateStep = (step: number) => {
    try {
      if (step === 1) {
        // Validate just the team name and description
        const { name, description } = formData;
        z.object({
          name: teamSchema.shape.name,
          description: teamSchema.shape.description,
        }).parse({ name, description });
      } else if (step === 2) {
        // Validate the RTO policy
        teamSchema.shape.rtoPolicy.parse(formData.rtoPolicy);
      }
      setFormErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Partial<TeamFormData> = {};
        err.errors.forEach((error) => {
          const path = error.path[0] as keyof TeamFormData;
          errors[path] = error.message;
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateStep(currentStep)) return;

    try {
      const team = await createTeam(formData.name, formData.description, {
        required_days: formData.rtoPolicy.required_days,
        core_hours: formData.rtoPolicy.hasCoreHours
          ? formData.rtoPolicy.core_hours
          : undefined,
        allowed_work_types: ["office", "remote", "flexible"],
      });

      // Show success state
      setSuccess(true);

      // Redirect after a delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error creating team:", err);
      setError(err instanceof Error ? err.message : "Failed to create team");
    }
  };

  // Success state
  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Team Created!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your team has been created successfully. You will be redirected to
            the dashboard...
          </p>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          Create a New Team
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Set up your team's workspace and RTO policy
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${(currentStep / totalSteps) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {(error || teamError) && (
        <div className="mb-6 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle
                className="h-5 w-5 text-red-400 dark:text-red-300"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                {error ||
                  (teamError instanceof Error
                    ? teamError.message
                    : "Failed to create team")}
              </h3>
            </div>
          </div>
        </div>
      )}

      <Card className="p-6">
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Team Information
                  </h4>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-200">
                    Create a team to manage your hybrid work schedule and
                    collaborate with your colleagues.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Team Name*
                </label>
                <div className="mt-1 relative">
                  <Tooltip content="Choose a descriptive name for your team">
                    <div className="flex">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          formErrors.name
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:border-primary focus:ring-primary"
                        } dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                        placeholder="e.g., Engineering Team"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                    </div>
                  </Tooltip>
                </div>
                {formErrors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description (Optional)
                </label>
                <div className="mt-1">
                  <Tooltip content="Provide details about your team's purpose and goals">
                    <div className="relative">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Describe your team's purpose and goals"
                      />
                      <div className="absolute right-3 top-3 text-gray-400">
                        <HelpCircle className="h-4 w-4" />
                      </div>
                    </div>
                  </Tooltip>
                </div>
              </div>

              {/* Examples section */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Examples of good team names:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Engineering Team</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Product Development</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Marketing & Communications</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/teams")}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleNextStep}>
                Next Step
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    RTO Policy Settings
                  </h4>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-200">
                    Define your team's return-to-office policy to help
                    coordinate in-person collaboration.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="required_days"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Required Office Days per Week
                </label>
                <Tooltip content="How many days per week should team members be in the office?">
                  <div className="relative mt-1">
                    <select
                      id="required_days"
                      name="rtoPolicy.required_days"
                      value={formData.rtoPolicy.required_days}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value={0}>No requirement</option>
                      <option value={1}>1 day per week</option>
                      <option value={2}>2 days per week</option>
                      <option value={3}>3 days per week</option>
                      <option value={4}>4 days per week</option>
                      <option value={5}>5 days per week</option>
                    </select>
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                  </div>
                </Tooltip>
              </div>

              <div className="flex items-center">
                <input
                  id="hasCoreHours"
                  name="hasCoreHours"
                  type="checkbox"
                  checked={formData.rtoPolicy.hasCoreHours}
                  onChange={handleCoreHoursToggle}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                />
                <Tooltip content="Core hours are times when team members should be present in the office">
                  <label
                    htmlFor="hasCoreHours"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    Set core hours
                    <HelpCircle className="h-4 w-4 ml-1 text-gray-400" />
                  </label>
                </Tooltip>
              </div>

              {formData.rtoPolicy.hasCoreHours && (
                <div className="pl-6 grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="core_hours_start"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="core_hours_start"
                      name="rtoPolicy.core_hours.start"
                      value={formData.rtoPolicy.core_hours?.start}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="core_hours_end"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      End Time
                    </label>
                    <input
                      type="time"
                      id="core_hours_end"
                      name="rtoPolicy.core_hours.end"
                      value={formData.rtoPolicy.core_hours?.end}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Policy explanation */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What does this mean?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Your team will need to be in the office{" "}
                  <strong>
                    {formData.rtoPolicy.required_days} day
                    {formData.rtoPolicy.required_days !== 1 ? "s" : ""}
                  </strong>{" "}
                  per week.
                </p>

                {formData.rtoPolicy.hasCoreHours &&
                  formData.rtoPolicy.core_hours && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      During office days, team members should be present between{" "}
                      <strong>{formData.rtoPolicy.core_hours.start}</strong> and{" "}
                      <strong>{formData.rtoPolicy.core_hours.end}</strong> for
                      collaborative work.
                    </p>
                  )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <Button type="button" variant="outline" onClick={handlePrevStep}>
                Previous Step
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={loading}
                disabled={loading}
              >
                Create Team
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
