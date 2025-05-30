import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Route name mapping
const routeNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'teams': 'Teams',
  'team': 'Team',
  'create': 'Create',
  'join': 'Join',
  'settings': 'Settings',
  'schedule': 'Schedule',
  'profile': 'Profile',
  'rewards': 'Rewards',
  'pulse': 'Team Pulse',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumbs on the dashboard
  if (pathnames.length === 1 && pathnames[0] === 'dashboard') {
    return null;
  }

  // Format team/ID route for better readability
  const formatPathname = (pathname: string, index: number) => {
    // Check if previous path is 'profile' and current path is an ID
    if (index > 0 && pathnames[index-1] === 'profile' && pathname.length > 8) {
      return 'My Profile';
    }
    
    // Check if previous path is 'team' and current path is 'pulse'
    if (index > 0 && pathnames[index-1] === 'team' && pathname === 'pulse') {
      return 'Team Pulse';
    }

    return routeNames[pathname] || pathname;
  };

  return (
    <nav className="py-2" aria-label="Breadcrumbs">
      <ol className="flex items-center space-x-1 text-sm">
        <li>
          <Link 
            to="/dashboard" 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        
        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const formattedName = formatPathname(pathname, index);
          
          return (
            <li key={routeTo} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {isLast ? (
                <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                  {formattedName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="ml-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {formattedName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}