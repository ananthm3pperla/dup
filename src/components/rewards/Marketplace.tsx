import React, { useState } from "react";
import {
  Search,
  Filter,
  Award,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import RewardCard, { Reward } from "./RewardCard";
import { motion, AnimatePresence } from "framer-motion";

interface MarketplaceProps {
  userPoints: number;
  rewards: Reward[];
  onRedeem: (rewardId: string) => void;
  className?: string;
}

type SortOption = "popular" | "newest" | "points-low" | "points-high";
type CategoryFilter = "all" | string;

export default function Marketplace({
  userPoints,
  rewards,
  onRedeem,
  className = "",
}: MarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories
  const categories = [
    "all",
    ...new Set(rewards.map((reward) => reward.category)),
  ];

  // Filter and sort rewards
  const filteredRewards = rewards
    .filter((reward) => {
      const matchesSearch =
        reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || reward.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "points-low":
          return a.pointsCost - b.pointsCost;
        case "points-high":
          return b.pointsCost - a.pointsCost;
        case "newest":
          return (
            new Date(b.expiresAt || "").getTime() -
            new Date(a.expiresAt || "").getTime()
          );
        case "popular":
        default:
          // For demo purposes, we'll use the remaining count as a proxy for popularity
          const aRemaining = a.remainingCount || 0;
          const bRemaining = b.remainingCount || 0;
          return bRemaining - aRemaining;
      }
    });

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* User Points Summary */}
      <Card className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">
                Your Reward Balance
              </h3>
              <p className="text-xl sm:text-3xl font-bold text-primary">
                {userPoints}{" "}
                <span className="text-sm sm:text-base font-normal text-gray-500 dark:text-gray-400">
                  points
                </span>
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <Button
              leftIcon={<Zap className="h-4 w-4" />}
              variant="outline"
              className="bg-white dark:bg-gray-800"
            >
              Earn More Points
            </Button>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="points-low">Points: Low to High</option>
            <option value="points-high">Points: High to Low</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setCategoryFilter(category)}
                        className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors ${
                          categoryFilter === category
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {category === "all" ? "All Categories" : category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredRewards.length > 0 ? (
          filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              onRedeem={onRedeem}
              disabled={userPoints < reward.pointsCost}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              No rewards found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No rewards match your search criteria"
                : "Check back soon for new rewards"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
