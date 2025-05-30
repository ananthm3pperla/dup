import React from 'react';
import { FileText, Search, Filter, Tag, Download } from 'lucide-react';
import { Card } from '@/components/ui';

const resourceTypes = [
  { type: 'guide', label: 'Guides', count: 12 },
  { type: 'template', label: 'Templates', count: 8 },
  { type: 'checklist', label: 'Checklists', count: 5 },
  { type: 'training', label: 'Training', count: 15 }
];

const mockResources = [
  {
    id: '1',
    title: '1:1 Meeting Best Practices',
    type: 'guide',
    description: 'Learn how to conduct effective one-on-one meetings with your team members.',
    tags: ['leadership', 'communication', '1:1'],
    downloads: 234
  },
  {
    id: '2',
    title: '1:1 Meeting Agenda Template',
    type: 'template',
    description: 'A customizable template for structuring your one-on-one meetings.',
    tags: ['templates', '1:1', 'productivity'],
    downloads: 567
  },
  {
    id: '3',
    title: 'Remote Work Guidelines',
    type: 'checklist',
    description: 'Essential checklist for managing remote and hybrid teams effectively.',
    tags: ['remote-work', 'management', 'hybrid'],
    downloads: 189
  }
];

export default function Resources() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-600 mb-6 max-w-md">
            Access guides, templates, and best practices for hybrid work management
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select className="border border-gray-300 rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
            <option value="">All types</option>
            {resourceTypes.map(type => (
              <option key={type.type} value={type.type}>
                {type.label} ({type.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockResources.map(resource => (
          <Card key={resource.id} className="group hover:shadow-lg transition-all duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${resource.type === 'guide' ? 'bg-primary/10 text-primary' :
                    resource.type === 'template' ? 'bg-success/10 text-success' :
                    'bg-warning/10 text-warning'}
                `}>
                  {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                </span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Download className="h-4 w-4" />
                  <span>{resource.downloads}</span>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{resource.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {resource.tags.map(tag => (
                  <div key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}