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
