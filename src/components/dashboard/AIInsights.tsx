import React, { useState, useEffect } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { LoadingState } from "../ui/LoadingState";
import { Brain, TrendingUp, Users, AlertTriangle } from "lucide-react";
import {
  analyzePulseData,
  generateWorkRecommendations,
} from "../../lib/openai";
import { useAuth } from "../../contexts/AuthContext";

interface AIInsightsProps {
  pulseData?: Array<{
    rating: number;
    comment?: string;
    date: string;
    userId: string;
  }>;
  teamData?: any;
}

export function AIInsights({ pulseData = [], teamData }: AIInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    if (pulseData.length === 0) return;

    setLoading(true);
    try {
      const [pulseInsights, workRecs] = await Promise.all([
        analyzePulseData(pulseData),
        generateWorkRecommendations(user, teamData),
      ]);

      setInsights(pulseInsights);
      setRecommendations(workRecs);
    } catch (error) {
      console.error("Error generating AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <Card.Title>AI Insights</Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <LoadingState />
        </Card.Content>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pulse Analysis */}
      {insights && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <Card.Title>Team Pulse Analysis</Card.Title>
            </div>
          </Card.Header>
          <Card.Content className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Overall Sentiment:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(insights.sentiment)}`}
              >
                {insights.sentiment.charAt(0).toUpperCase() +
                  insights.sentiment.slice(1)}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {insights.summary}
              </p>
            </div>

            {insights.keyThemes?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Themes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insights.keyThemes.map((theme: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insights.riskFactors?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {insights.riskFactors.map((risk: string, index: number) => (
                    <li
                      key={index}
                      className="text-sm text-red-600 dark:text-red-400"
                    >
                      • {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Work Recommendations */}
      {recommendations && (
        <Card>
          <Card.Header>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <Card.Title>Personalized Recommendations</Card.Title>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {recommendations.recommendations?.map(
                (rec: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {rec.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rec.description}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Impact: {rec.impact}
                    </p>
                  </div>
                ),
              )}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Generate Button */}
      <Card>
        <Card.Content className="text-center py-8">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            AI-Powered Insights
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get personalized recommendations and team insights powered by AI
          </p>
          <Button
            onClick={generateInsights}
            disabled={loading || pulseData.length === 0}
            leftIcon={<Brain className="h-4 w-4" />}
          >
            {pulseData.length === 0
              ? "No Data Available"
              : "Generate AI Insights"}
          </Button>
        </Card.Content>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Card, Button } from "@/components/ui";
import { Brain, TrendingUp, Users, Calendar, Lightbulb, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isDemoMode } from "@/lib/demo";
import { analyticsAPI } from "@/lib/api";

interface Insight {
  id: string;
  type: "productivity" | "collaboration" | "wellness" | "scheduling";
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  priority: "high" | "medium" | "low";
  dismissible: boolean;
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        if (isDemoMode()) {
          // Demo insights
          const demoInsights: Insight[] = [
            {
              id: "1",
              type: "productivity",
              title: "Peak Productivity Hours",
              description: "Your team is most productive between 10 AM - 12 PM. Consider scheduling important meetings during this time.",
              priority: "high",
              dismissible: true,
            },
            {
              id: "2",
              type: "collaboration",
              title: "Team Collaboration Opportunity",
              description: "3 team members will be in the office tomorrow. Perfect time for a collaborative session!",
              action: {
                label: "Schedule Meeting",
                onClick: () => console.log("Schedule meeting clicked"),
              },
              priority: "medium",
              dismissible: true,
            },
            {
              id: "3",
              type: "wellness",
              title: "Work-Life Balance",
              description: "You've been working late 3 days this week. Consider taking breaks to maintain productivity.",
              priority: "medium",
              dismissible: true,
            },
          ];
          setInsights(demoInsights);
        } else {
          const response = await analyticsAPI.getAIInsights();
          if (response.success) {
            setInsights(response.data || []);
          }
        }
      } catch (error) {
        console.error("Error loading AI insights:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const getTypeIcon = (type: Insight["type"]) => {
    switch (type) {
      case "productivity":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "collaboration":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "wellness":
        return <Brain className="h-4 w-4 text-purple-500" />;
      case "scheduling":
        return <Calendar className="h-4 w-4 text-orange-500" />;
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: Insight["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      case "low":
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/10";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-900/10";
    }
  };

  const handleDismiss = (insightId: string) => {
    setDismissedInsights(prev => [...prev, insightId]);
  };

  const visibleInsights = insights.filter(insight => !dismissedInsights.includes(insight.id));

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-default">AI Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse border-l-4 border-gray-200 bg-gray-100 dark:bg-gray-800 p-4 rounded-r-lg">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-default">AI Insights</h3>
      </div>

      {visibleInsights.length === 0 ? (
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-muted">No new insights available</p>
          <p className="text-sm text-muted mt-1">Check back later for personalized recommendations</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {visibleInsights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(insight.type)}
                      <h4 className="font-medium text-default">{insight.title}</h4>
                    </div>
                    <p className="text-sm text-muted mb-3">{insight.description}</p>
                    {insight.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={insight.action.onClick}
                      >
                        {insight.action.label}
                      </Button>
                    )}
                  </div>
                  {insight.dismissible && (
                    <button
                      onClick={() => handleDismiss(insight.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
