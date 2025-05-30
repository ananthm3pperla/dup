import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Calendar, Users, ChevronLeft, CheckSquare, MessageSquare } from 'lucide-react';
import { Card, Button } from '@/components/ui';

const mockGoal = {
  id: '1',
  title: 'Improve Team Collaboration',
  description: 'Increase cross-team collaboration and knowledge sharing through regular sync meetings and documentation.',
  progress: 75,
  dueDate: '2025-06-30',
  category: 'team',
  status: 'on_track',
  milestones: [
    {
      id: 'm1',
      title: 'Set up weekly team syncs',
      completed: true,
      completedDate: '2025-01-15'
    },
    {
      id: 'm2',
      title: 'Create knowledge sharing documentation',
      completed: true,
      completedDate: '2025-02-28'
    },
    {
      id: 'm3',
      title: 'Implement cross-team project reviews',
      completed: false,
      dueDate: '2025-04-30'
    }
  ],
  updates: [
    {
      id: 'u1',
      date: '2025-02-28',
      content: 'Completed documentation phase ahead of schedule',
      type: 'milestone'
    },
    {
      id: 'u2',
      date: '2025-02-15',
      content: 'Team engagement has increased by 25% since implementing weekly syncs',
      type: 'progress'
    }
  ]
};

export default function GoalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/goals')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Goals
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{mockGoal.title}</h1>
                    <p className="mt-1 text-sm text-gray-500">{mockGoal.description}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">{mockGoal.progress}% Complete</span>
                    <span className="text-gray-500">Due {new Date(mockGoal.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${mockGoal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${mockGoal.status === 'on_track' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}
              `}>
                {mockGoal.status === 'on_track' ? 'On Track' : 'At Risk'}
              </span>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Milestones</h2>
              <div className="space-y-4">
                {mockGoal.milestones.map(milestone => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <div className={`
                      mt-1 h-5 w-5 rounded flex items-center justify-center
                      ${milestone.completed ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-400'}
                    `}>
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{milestone.title}</p>
                      <p className="text-xs text-gray-500">
                        {milestone.completed 
                          ? `Completed on ${new Date(milestone.completedDate).toLocaleDateString()}`
                          : `Due by ${new Date(milestone.dueDate).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Updates</h2>
              <div className="space-y-4">
                {mockGoal.updates.map(update => (
                  <div key={update.id} className="flex items-start gap-3">
                    <div className={`
                      mt-1 h-5 w-5 rounded flex items-center justify-center
                      ${update.type === 'milestone' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}
                    `}>
                      {update.type === 'milestone' ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{update.content}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(update.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Goal Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <div className="mt-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">Team</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(mockGoal.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Update
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckSquare className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}