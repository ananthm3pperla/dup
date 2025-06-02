import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ArrowRight,
  User,
  Users,
  Calendar,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui";

interface WelcomeAnimationProps {
  userName: string;
  userRole?: "manager" | "individual_contributor";
  onComplete: () => void;
}

export default function WelcomeAnimation({
  userName,
  userRole,
  onComplete,
}: WelcomeAnimationProps) {
  const [step, setStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const firstName = userName.split(" ")[0] || "there";

  useEffect(() => {
    if (isAutoPlaying && step < 3) {
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
        if (step === 2) {
          setIsAutoPlaying(false);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, isAutoPlaying]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  };

  const handleSkip = () => {
    setIsComplete(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const welcomeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  // Manager-specific welcome content
  const managerContent = [
    {
      icon: <Building2 className="h-16 w-16 text-primary" />,
      title: `Welcome to Hi-Bridge, ${firstName}!`,
      description:
        "We're excited to help you create a thriving hybrid workplace where your team can excel.",
    },
    {
      icon: <Users className="h-16 w-16 text-primary" />,
      title: "Build Your Team Culture",
      description:
        "Set up your team's RTO policy, define anchor days for collaboration, and foster an engaged hybrid workplace.",
    },
    {
      icon: <Calendar className="h-16 w-16 text-primary" />,
      title: "Schedule with Confidence",
      description:
        "Use our tools to coordinate in-office days and maximize team productivity, both remotely and in person.",
    },
    {
      icon: <Sparkles className="h-16 w-16 text-primary" />,
      title: "Let's Get Started!",
      description:
        "Ready to set up your hybrid workplace? Let's start by answering a few quick questions to personalize your experience.",
    },
  ];

  // Individual contributor welcome content
  const contributorContent = [
    {
      icon: <Building2 className="h-16 w-16 text-primary" />,
      title: `Welcome to Hi-Bridge, ${firstName}!`,
      description: "We're excited to help you thrive in the hybrid workplace.",
    },
    {
      icon: <User className="h-16 w-16 text-primary" />,
      title: "Plan Your Best Work Week",
      description:
        "Schedule your office days, coordinate with teammates, and maximize both in-office collaboration and remote productivity.",
    },
    {
      icon: <Calendar className="h-16 w-16 text-primary" />,
      title: "Earn Rewards & Recognition",
      description:
        "Earn reward days for office attendance and participate in team activities to build a vibrant hybrid culture.",
    },
    {
      icon: <Sparkles className="h-16 w-16 text-primary" />,
      title: "Let's Get Started!",
      description:
        "Ready to optimize your hybrid work experience? Let's start by answering a few quick questions.",
    },
  ];

  const content = userRole === "manager" ? managerContent : contributorContent;

  return (
    <div className="max-w-md w-full mx-auto">
      <AnimatePresence mode="wait">
        {!isComplete && (
          <motion.div
            key={`welcome-step-${step}`}
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6 p-6 bg-primary/10 dark:bg-primary/20 rounded-full"
            >
              {content[step].icon}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {content[step].title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-gray-600 dark:text-gray-300 mb-8"
            >
              {content[step].description}
            </motion.p>

            <div className="w-full">
              <Button
                onClick={handleNext}
                className="w-full"
                rightIcon={
                  step < 3 ? (
                    <ArrowRight className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )
                }
              >
                {step < 3 ? "Continue" : "Get Started"}
              </Button>

              {step < 3 && (
                <button
                  onClick={handleSkip}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Skip introduction
                </button>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center space-x-2 mt-8">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i === step
                      ? "w-4 bg-primary"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
