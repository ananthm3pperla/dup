import React from 'react';
import { Target, TrendingUp, Users, Calendar, Plus } from 'lucide-react';
import { Card, Button } from '@/components/ui';

const mockGoals = [
  {
    id: '1',
    title: 'Improve Team Collaboration',
    description: 'Increase cross-team collaboration and knowledge sharing.',
    progress: 75,
    dueDate: '2025-06-30',
    category: 'team',
    status: 'on_track'
  },
  {
    id: '2',
    title: 'Office Attendance Target',
    description: 'Meet required office days per RTO policy.',
    progress: 60,
    dueDate: '2025-03-31',
    category: 'attendance',
    status: 'at_risk'
  },
  {
    id: '3',
    title: 'Leadership Development',
    description: 'Complete leadership training and mentorship program.',
    progress: 40,
    dueDate: '2025-12-31',
    category: 'personal',
    status: 'on_track'
  }
];

export default function Goals() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your personal and team goals
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />}>
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Progress</p>
              <p className="text-2xl font-semibold text-gray-900">58%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Goals On Track</p>
              <p className="text-2xl font-semibold text-gray-900">2/3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {mockGoals.map(goal => (
          <Card key={goal.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className={`
                h-10 w-10 rounded-lg flex items-center justify-center
                ${goal.category === 'team' ? 'bg-primary/10' :
                  goal.category === 'attendance' ? 'bg-success/10' :
                  'bg-warning/10'}
              `}>
                {goal.category === 'team' ? (
                  <Users className="h-5 w-5 text-primary" />
                ) : goal.category === 'attendance' ? (
                  <Calendar className="h-5 w-5 text-success" />
                ) : (
                  <Target className="h-5 w-5 text-warning" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
                  </div>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${goal.status === 'on_track' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}
                  `}>
                    {goal.status === 'on_track' ? 'On Track' : 'At Risk'}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">{goal.progress}% Complete</span>
                    <span className="text-gray-500">Due {new Date(goal.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.status === 'on_track' ? 'bg-success' : 'bg-warning'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}