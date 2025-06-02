import React from "react";
import { Award, Clock, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui";
import { motion } from "framer-motion";

export interface Reward {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  category: string;
  availability: "limited" | "unlimited";
  expiresAt?: string;
  remainingCount?: number;
}

interface RewardCardProps {
  reward: Reward;
  onRedeem: (rewardId: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function RewardCard({
  reward,
  onRedeem,
  disabled = false,
  className = "",
}: RewardCardProps) {
  const handleRedeem = () => {
    if (!disabled) {
      onRedeem(reward.id);
    }
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img
          src={reward.imageUrl}
          alt={reward.title}
          className="w-full h-36 sm:h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-primary/90 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
          {reward.pointsCost} points
        </div>
        {reward.availability === "limited" && reward.remainingCount && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {reward.remainingCount} remaining
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
            {reward.title}
          </h3>
          <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            <Tag className="h-3 w-3" />
            {reward.category}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {reward.description}
        </p>

        {reward.expiresAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Calendar className="h-3.5 w-3.5" />
            Expires: {new Date(reward.expiresAt).toLocaleDateString()}
          </div>
        )}

        <Button
          onClick={handleRedeem}
          disabled={disabled}
          className="w-full justify-center text-white text-xs sm:text-sm"
          leftIcon={<Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        >
          {disabled ? "Not Enough Points" : "Redeem Reward"}
        </Button>
      </div>
    </motion.div>
  );
}
