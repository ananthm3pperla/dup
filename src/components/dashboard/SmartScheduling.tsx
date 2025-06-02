
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Calendar, Clock, Users, Sparkles } from 'lucide-react';
import { suggestMeetingTimes } from '../../lib/openai';

interface SmartSchedulingProps {
  teamSchedule?: any;
}

export function SmartScheduling({ teamSchedule }: SmartSchedulingProps) {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(60);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const result = await suggestMeetingTimes(teamSchedule, meetingDuration);
      setSuggestions(result);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <Card.Title>Smart Meeting Scheduler</Card.Title>
        </div>
      </Card.Header>
      <Card.Content className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium">Duration:</label>
          </div>
          <select
            value={meetingDuration}
            onChange={(e) => setMeetingDuration(Number(e.target.value))}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>

        <Button
          onClick={generateSuggestions}
          disabled={loading}
          leftIcon={<Sparkles className="h-4 w-4" />}
          className="w-full"
        >
          {loading ? 'Generating...' : 'Get AI Suggestions'}
        </Button>

        {suggestions?.suggestions && (
          <div className="space-y-3 mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Recommended Times:</h4>
            {suggestions.suggestions.map((suggestion: any, index: number) => (
              <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {new Date(suggestion.time).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-300">
                    {suggestion.attendanceRate}% attendance
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{suggestion.reason}</p>
              </div>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
