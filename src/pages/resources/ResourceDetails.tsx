import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, ChevronLeft, Tag, Eye, ThumbsUp } from 'lucide-react';
import { Card, Button } from '@/components/ui';

const mockResource = {
  id: '1',
  title: '1:1 Meeting Best Practices',
  type: 'guide',
  description: 'Learn how to conduct effective one-on-one meetings with your team members.',
  content: `
# Effective One-on-One Meetings Guide

## Introduction
One-on-one meetings are essential for building strong relationships with your team members and ensuring their growth and success.

## Key Components
1. Regular Schedule
2. Prepared Agenda
3. Active Listening
4. Clear Action Items
5. Follow-up Plan

## Best Practices
- Schedule recurring meetings
- Let the employee lead
- Take notes
- Focus on development
- Address concerns early
`,
  tags: ['leadership', 'communication', '1:1'],
  downloads: 234,
  views: 1205,
  likes: 89,
  lastUpdated: '2025-02-15T10:30:00Z'
};

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/resources')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Resources
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className={`
                px-2 py-1 text-xs font-medium rounded-full
                ${mockResource.type === 'guide' ? 'bg-primary/10 text-primary' :
                  mockResource.type === 'template' ? 'bg-success/10 text-success' :
                  'bg-warning/10 text-warning'}
              `}>
                {mockResource.type.charAt(0).toUpperCase() + mockResource.type.slice(1)}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-gray-900">{mockResource.title}</h1>
            </div>
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download
            </Button>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{mockResource.downloads} downloads</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{mockResource.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{mockResource.likes} likes</span>
            </div>
            <div>
              Last updated: {new Date(mockResource.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="prose max-w-none">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{mockResource.description}</p>
            </div>

            <div className="mt-8 space-y-4">
              {mockResource.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="text-2xl font-bold">{line.slice(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-xl font-semibold mt-6">{line.slice(3)}</h2>;
                }
                if (line.startsWith('- ')) {
                  return <li key={index} className="ml-4">{line.slice(2)}</li>;
                }
                if (line.match(/^\d\./)) {
                  return <div key={index} className="ml-4">{line}</div>;
                }
                return line ? <p key={index}>{line}</p> : null;
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Tags</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {mockResource.tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  <Tag className="h-3 w-3" />
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}