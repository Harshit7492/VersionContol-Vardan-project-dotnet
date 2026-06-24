import React, { useState } from 'react';
import { X, Filter, RefreshCw } from 'lucide-react';

export interface Filters {
  activityId: string;
  userId: string;
  isActive: string;
  fromDate: string;
  toDate: string;
}

interface ActivityDetailsFilterProps {
  filters: Filters;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  loading?: boolean;
  totalCount?: number;
  activities: Array<{ activityId: number; activityName: string }>;
  users: Array<{ userId: number; firstName: string; lastName: string; strEmail: string }>;
  loadingActivities?: boolean;
  loadingUsers?: boolean;
}

// ============================================
// Main Component
// ============================================

const ActivityDetailsFilter: React.FC<ActivityDetailsFilterProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
  loading = false,
  totalCount = 0,
  activities = [],
  users = [],
  loadingActivities = false,
  loadingUsers = false,
}) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className='mb-6 rounded-lg bg-white p-4 shadow-md border border-gray-200'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter size={18} />
          <span className='font-medium'>Filters</span>
          {hasActiveFilters && (
            <span className='ml-1 px-2 py-0.5 text-xs bg-blue-200 text-blue-800 rounded-full'>
              Active
            </span>
          )}
        </button>
        
        <div className='flex items-center gap-2'>
          {totalCount > 0 && (
            <span className='text-sm text-gray-500 mr-2'>
              Total: {totalCount} activities
            </span>
          )}
          <button
            onClick={onApplyFilters}
            disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
            {/* Activity Dropdown */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Activity
              </label>
              <select
                value={filters.activityId}
                onChange={(e) => onFilterChange('activityId', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={loadingActivities}
              >
                <option value=''>All Activities</option>
                {activities.map((activity) => (
                  <option key={activity.activityId} value={activity.activityId.toString()}>
                    {activity.activityName}
                  </option>
                ))}
              </select>
              {loadingActivities && (
                <p className='text-xs text-gray-400 mt-1'>Loading activities...</p>
              )}
            </div>
            
            {/* User Dropdown */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                User
              </label>
              <select
                value={filters.userId}
                onChange={(e) => onFilterChange('userId', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={loadingUsers}
              >
                <option value=''>All Users</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId.toString()}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              {loadingUsers && (
                <p className='text-xs text-gray-400 mt-1'>Loading users...</p>
              )}
            </div>
            
            {/* Status Dropdown */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => onFilterChange('isActive', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>All Status</option>
                <option value='true'>Active</option>
                <option value='false'>Inactive</option>
              </select>
            </div>
            
            {/* From Date - Date only */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                From Date
              </label>
              <input
                type='date'
                value={filters.fromDate}
                onChange={(e) => onFilterChange('fromDate', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            
            {/* To Date - Date only */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                To Date
              </label>
              <input
                type='date'
                value={filters.toDate}
                onChange={(e) => onFilterChange('toDate', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            
            <div className='flex items-end'>
              <button
                onClick={onClearFilters}
                className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
              >
                <X size={16} />
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDetailsFilter;