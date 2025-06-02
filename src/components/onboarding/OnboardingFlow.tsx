import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileSetup from "./steps/ProfileSetup";
import RoleSelection from "./steps/RoleSelection";
import TeamSetup from "./steps/TeamSetup";
import WorkPreferences from "./steps/WorkPreferences";
import Completion from "./steps/Completion";
import { Button } from "@/components/ui";
import { Beaker } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeAnimation from "./WelcomeAnimation";
import OnboardingLayout from "./OnboardingLayout";

interface OnboardingFlowProps {
  userId: string;
  userEmail: string;
  initialName?: string;
  onComplete: () => void;
}

export default function OnboardingFlow({
  userId,
  userEmail,
  initialName = "",
  onComplete,
}: OnboardingFlowProps) {
  const { enterDemoMode } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    fullName: initialName,
    companyName: "",
    jobTitle: "",
    department: "",
    officeLocation: "",
  });
  const [role, setRole] = useState<"manager" | "individual_contributor">(
    "individual_contributor",
  );
  const [team, setTeam] = useState({
    name: "",
    description: "",
    requiredDays: 2,
    hasCoreHours: true,
    coreHours: {
      start: "10:00",
      end: "16:00",
    },
  });
  const [workPreferences, setWorkPreferences] = useState({
    preferredOfficeDays: 2,
    officeMotivators: [],
    attendanceBarriers: [],
    additionalFeedback: "",
  });
  const [enteringDemoMode, setEnteringDemoMode] = useState(false);

  const totalSteps = role === "manager" ? 5 : 4; // One extra step for managers to set up team

  // Define step titles
  const stepTitles = [
    "Your Profile",
    "Your Role",
    role === "manager" ? "Team Setup" : "Work Preferences",
    role === "manager" ? "Work Preferences" : "Complete",
    "Complete",
  ];

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  const handleProfileComplete = (data: any) => {
    setProfile(data);
    setStep(2);
  };

  const handleRoleSelected = (
    selectedRole: "manager" | "individual_contributor",
  ) => {
    setRole(selectedRole);
    setStep(3);
  };

  const handleTeamComplete = (data: any) => {
    setTeam(data);
    setStep(role === "manager" ? 4 : 3);
  };

  const handleWorkPreferencesComplete = (data: any) => {
    setWorkPreferences(data);
    setStep(role === "manager" ? 5 : 4);
  };

  const handleDemoMode = async () => {
    setEnteringDemoMode(true);
    try {
      await enterDemoMode();
      // Navigate will happen automatically because of AuthContext
    } catch (error) {
      console.error("Error entering demo mode:", error);
    } finally {
      setEnteringDemoMode(false);
    }
  };

  // If showing welcome animation, only show that
  if (showWelcome) {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <WelcomeAnimation
          userName={initialName || userEmail.split("@")[0] || "there"}
          userRole={role}
          onComplete={handleWelcomeComplete}
        />

        <button
          onClick={handleWelcomeComplete}
          className="mt-8 text-sm text-center text-gray-500 hover:text-primary mx-auto"
        >
          Skip introduction
        </button>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <OnboardingLayout
            currentStep={step}
            totalSteps={totalSteps}
            title="Tell us about yourself"
            description="Let's personalize your experience"
            steps={stepTitles.slice(0, totalSteps)}
          >
            <ProfileSetup
              initialData={profile}
              onComplete={handleProfileComplete}
            />
          </OnboardingLayout>
        );
      case 2:
        return (
          <OnboardingLayout
            currentStep={step}
            totalSteps={totalSteps}
            title="What's your role?"
            description="This helps us customize your experience"
            steps={stepTitles.slice(0, totalSteps)}
          >
            <RoleSelection
              onSelect={handleRoleSelected}
              onBack={() => setStep(1)}
            />
          </OnboardingLayout>
        );
      case 3:
        return role === "manager" ? (
          <OnboardingLayout
            currentStep={step}
            totalSteps={totalSteps}
            title="Set up your team"
            description="Configure your team's hybrid work settings"
            steps={stepTitles.slice(0, totalSteps)}
          >
            <TeamSetup
              initialData={team}
              onComplete={handleTeamComplete}
              onBack={() => setStep(2)}
            />
          </OnboardingLayout>
        ) : (
          <OnboardingLayout
            currentStep={step}
            totalSteps={totalSteps}
            title="Work preferences"
            description="Tell us about your hybrid work preferences"
            steps={stepTitles.slice(0, totalSteps)}
          >
            <WorkPreferences
              initialData={workPreferences}
              onComplete={handleWorkPreferencesComplete}
              onBack={() => setStep(2)}
            />
          </OnboardingLayout>
        );
      case 4:
        return role === "manager" ? (
          <OnboardingLayout
            currentStep={step}
            totalSteps={totalSteps}
            title="Work preferences"
            description="Tell us about your hybrid work preferences"
            steps={stepTitles.slice(0, totalSteps)}
          >
            <WorkPreferences
              initialData={workPreferences}
              onComplete={handleWorkPreferencesComplete}
              onBack={() => setStep(3)}
            />
          </OnboardingLayout>
        ) : (
          <OnboardingLayout
            currentStep={step}
            totalSteps={totalSteps}
            title="You're all set!"
            description="Your account is ready to go"
            steps={stepTitles.slice(0, totalSteps)}
          >
            <Completion
              profile={profile}
              role={role}
              workPreferences={workPreferences}
              onComplete={onComplete}
            />
          </OnboardingLayout>
        );
      case 5:
        return (
          <OnboardingLayout
            currentStep={step}
            totalSteps={totalSteps}
            title="You're all set!"
            description="Your account is ready to go"
            steps={stepTitles.slice(0, totalSteps)}
          >
            <Completion
              profile={profile}
              role={role}
              team={team}
              workPreferences={workPreferences}
              onComplete={onComplete}
            />
          </OnboardingLayout>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderStep()}

      {/* Demo mode button */}
      <div className="text-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDemoMode}
          isLoading={enteringDemoMode}
          leftIcon={<Beaker className="h-4 w-4" />}
          className="mx-auto"
        >
          Skip & Try Demo Mode
        </Button>
      </div>
    </>
  );
}
