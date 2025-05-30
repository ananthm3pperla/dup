import React from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

interface TeamFiltersProps {
  searchQuery: string;
  selectedDepartment: string;
  departments: string[];
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
}

export default function TeamFilters({
  searchQuery,
  selectedDepartment,
  departments,
  onSearchChange,
  onDepartmentChange,
}: TeamFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary focus:ring-primary text-sm shadow-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
          aria-label="Search team members"
        />
      </div>

      {/* Department Filter */}
      <div className="relative w-full md:w-64 group">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:border-primary focus:ring-primary text-sm shadow-sm transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 appearance-none cursor-pointer"
          aria-label="Filter by department"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-gray-500 pointer-events-none transition-colors" />
      </div>
    </div>
  );
}