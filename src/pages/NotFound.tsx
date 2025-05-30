import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 text-center">
        <FileQuestion className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" />
        
        <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </h1>
        
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Button
            onClick={() => navigate('/')}
            leftIcon={<Home className="h-4 w-4" />}
            className="mx-auto"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}