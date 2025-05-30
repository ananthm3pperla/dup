import React from 'react';
import { Trophy, Users, Calendar, MapPin, Gift, TrendingUp, ExternalLink } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { motion } from 'framer-motion';

export default function HiBridgeGames() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Hi-Bridge Games
            <span className="ml-2 text-sm font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Beta
            </span>
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Compete with other teams in the Dallas area and win exciting rewards!
          </p>
        </div>
        <Button 
          className="whitespace-nowrap"
          rightIcon={<ExternalLink className="h-4 w-4" />}
        >
          View Leaderboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 h-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              Beta Overview
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">1</span>
                </span>
                <span>Limited beta in Dallas area (2–3 weeks)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">2</span>
                </span>
                <span>Manager-created teams compete on participation metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">3</span>
                </span>
                <span>Gather data, create momentum, and validate MVP</span>
              </li>
            </ul>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="p-6 h-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-success" />
              Format
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-success">1</span>
                </span>
                <span>Point system tied to feature use and collaboration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-success">2</span>
                </span>
                <span>Public leaderboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-success">3</span>
                </span>
                <span>Bonus points for team engagement (e.g., in-office photos)</span>
              </li>
            </ul>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6 h-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-secondary" />
              Sponsorship
            </h3>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-secondary">1</span>
                </span>
                <span>Local businesses provide prizes (e.g., pizzas, discounts)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-secondary">2</span>
                </span>
                <span>Hi-Bridge promotes partner brands to users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-secondary">3</span>
                </span>
                <span>Partnership models: Free items or partial team credits</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 dark:from-primary/10 dark:to-primary/20">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Why It Matters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Real-world proof</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Validate product outcomes with actual users</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Local impact</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stimulates local economic activity</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">High participation</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Drives 70%+ target participation rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg"
          leftIcon={<Trophy className="h-5 w-5" />}
          className="px-8"
        >
          Join the Games
        </Button>
      </div>
    </div>
  );
}