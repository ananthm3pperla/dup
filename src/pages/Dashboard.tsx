import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to Hi-Bridge! Your hybrid work engagement platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Daily Pulse</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Share how you're feeling today
          </p>
          <div className="mt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Submit Pulse
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Team Schedule</h3>
          <p className="text-gray-600 dark:text-gray-400">
            See who's in the office today
          </p>
          <div className="mt-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              View Schedule
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">My Points</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Current engagement score
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-blue-600">125</span>
            <span className="text-gray-500 ml-2">points</span>
          </div>
        </div>
      </div>
    </div>
  );
}