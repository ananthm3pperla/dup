import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm lg:fixed lg:w-full lg:pl-64 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <button
              type="button"
              className="lg:hidden px-4 text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
            </button>

            <Link
              to={`/profile/${user?.id}`}
              className="relative flex items-center gap-2 text-sm focus:outline-none"
            >
              <button
                type="button"
                className="flex items-center gap-2 text-sm focus:outline-none"
              >
                <img
                  src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
                <span className="hidden lg:block">{user?.email}</span>
              </button>
            </Link>

            <button
              onClick={handleSignOut}
              className="p-1 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Sign out</span>
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}