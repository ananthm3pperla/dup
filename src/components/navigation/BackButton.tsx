import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  to,
  label = "Back",
  className = "",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.button
      whileHover={{ x: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={`flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors ${className}`}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>{label}</span>
    </motion.button>
  );
}
