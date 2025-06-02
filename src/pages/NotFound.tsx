
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">
            404
          </h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Card className="mt-8 p-6">
          <div className="space-y-4">
            <Link to="/" className="block">
              <Button 
                className="w-full"
                leftIcon={<Home className="h-4 w-4" />}
              >
                Go to Homepage
              </Button>
            </Link>
            
            <Button 
              variant="outline"
              className="w-full"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If you believe this is an error, please{' '}
            <Link 
              to="/feedback" 
              className="text-primary hover:text-primary/80 underline"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
