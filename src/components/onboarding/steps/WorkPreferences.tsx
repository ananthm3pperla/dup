import React, { useState } from "react";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Button, Alert } from "@/components/ui";

interface WorkPreferencesData {
  preferredOfficeDays: number;
  officeMotivators: string[];
  attendanceBarriers: string[];
  additionalFeedback: string;
}

interface WorkPreferencesProps {
  initialData?: Partial<WorkPreferencesData>;
  onComplete: (data: WorkPreferencesData) => void;
  onBack: () => void;
}

export default function WorkPreferences({
  initialData = {},
  onComplete,
  onBack,
}: WorkPreferencesProps) {
  const [formData, setFormData] = useState<WorkPreferencesData>({
    preferredOfficeDays: initialData.preferredOfficeDays || 2,
    officeMotivators: initialData.officeMotivators || [],
    attendanceBarriers: initialData.attendanceBarriers || [],
    additionalFeedback: initialData.additionalFeedback || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      const optionValue = (e.target as HTMLInputElement).value;

      if (name === "officeMotivators") {
        setFormData((prev) => {
          const newMotivators = checked
            ? [...prev.officeMotivators, optionValue]
            : prev.officeMotivators.filter((item) => item !== optionValue);
          return { ...prev, officeMotivators: newMotivators };
        });
      } else if (name === "attendanceBarriers") {
        setFormData((prev) => {
          const newBarriers = checked
            ? [...prev.attendanceBarriers, optionValue]
            : prev.attendanceBarriers.filter((item) => item !== optionValue);
          return { ...prev, attendanceBarriers: newBarriers };
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "preferredOfficeDays" ? parseInt(value, 10) : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Work preferences
      </h2>

      <Alert variant="info" className="mb-6">
        <p className="text-sm">
          Your preferences help us optimize team coordination and improve the
          hybrid work experience.
        </p>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="preferredOfficeDays"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            How many days per week do you prefer to be in the office?
          </label>
          <select
            id="preferredOfficeDays"
            name="preferredOfficeDays"
            value={formData.preferredOfficeDays}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value={0}>0 days (fully remote)</option>
            <option value={1}>1 day</option>
            <option value={2}>2 days</option>
            <option value={3}>3 days</option>
            <option value={4}>4 days</option>
            <option value={5}>5 days (fully in-office)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What motivates you to come into the office? (Select all that apply)
          </label>
          <div className="space-y-2">
            {[
              {
                id: "collaboration",
                label: "In-person collaboration with teammates",
              },
              { id: "focus", label: "Better focus environment than home" },
              {
                id: "separation",
                label: "Separation between work and personal life",
              },
              { id: "social", label: "Social interaction and camaraderie" },
              { id: "career", label: "Career visibility and opportunities" },
            ].map((option) => (
              <div key={option.id} className="flex items-start">
                <input
                  id={`motivator-${option.id}`}
                  name="officeMotivators"
                  type="checkbox"
                  value={option.id}
                  checked={formData.officeMotivators.includes(option.id)}
                  onChange={handleChange}
                  className="h-4 w-4 mt-0.5 border-gray-300 rounded text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`motivator-${option.id}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are your main barriers to office attendance? (Select all that
            apply)
          </label>
          <div className="space-y-2">
            {[
              { id: "commute", label: "Long commute time" },
              { id: "productivity", label: "Lower productivity than at home" },
              {
                id: "flexibility",
                label: "Need flexibility for personal commitments",
              },
              {
                id: "environment",
                label: "Office environment (noise, distractions)",
              },
              { id: "cost", label: "Cost (transportation, meals, etc.)" },
            ].map((option) => (
              <div key={option.id} className="flex items-start">
                <input
                  id={`barrier-${option.id}`}
                  name="attendanceBarriers"
                  type="checkbox"
                  value={option.id}
                  checked={formData.attendanceBarriers.includes(option.id)}
                  onChange={handleChange}
                  className="h-4 w-4 mt-0.5 border-gray-300 rounded text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`barrier-${option.id}`}
                  className="ml-2 block text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="additionalFeedback"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Any additional thoughts about your hybrid work preferences?
            (Optional)
          </label>
          <textarea
            id="additionalFeedback"
            name="additionalFeedback"
            value={formData.additionalFeedback}
            onChange={handleChange}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            placeholder="Share any other preferences or considerations..."
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" rightIcon={<ArrowRight className="h-4 w-4" />}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
