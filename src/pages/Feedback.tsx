import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function Feedback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        <MessageSquare className="h-12 w-12 text-primary" aria-hidden="true" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-default mb-4">
        Feedback System Coming Soon
      </h1>
      <p className="text-muted max-w-md mb-8">
        We're building a comprehensive feedback system to help improve your hybrid work experience. 
        Soon you'll be able to share your thoughts and suggestions directly through this platform.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
        {[
          'Anonymous Feedback',
          'Suggestion Box',
          'Improvement Tracking'
        ].map((feature) => (
          <div 
            key={feature}
            className="bg-card p-4 rounded-lg border border-default"
          >
            <p className="font-medium text-default">{feature}</p>
            <p className="text-sm text-muted mt-1">Coming Soon</p>
          </div>
        ))}
      </div>
    </div>
  );
}