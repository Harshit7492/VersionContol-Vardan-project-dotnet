import React, { useState, useEffect } from 'react';
import { Edit, Eye, RefreshCw, Search, CheckCircle, XCircle, Calendar, MapPin, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';

interface ActivityGridProps {
  onEdit: (activity: any) => void;
  onView: (id: number) => void;
}

interface ActivityEntry {
  ActivityDetailId: number;
  ActivityId: number;
  ActivitySubject: string;
  ActivityDiscription: string;
  CurrentLocation: string;
  Latitude: number;
  Longitude: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string | null;
}

const ActivityGrid: React.FC<ActivityGridProps> = ({ onEdit, onView }) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    activityId: '',
    userId: '',
    activitySubject: '',
    isActive: '',
    fromDate: '',
    toDate: '',
  });

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Build filter params
      const params: any = {
        pageNumber,
        pageSize,
      };

      // Add filters if they have values
      if (filters.activityId) params.ActivityId = parseInt(filters.activityId);
      if (filters.userId) params.UserId = parseInt(filters.userId);
      if (filters.activitySubject) params.ActivitySubject = filters.activitySubject;
      if (filters.isActive !== '') params.IsActive = filters.isActive === 'true';
      if (filters.fromDate) params.FromDate = new Date(filters.fromDate).toISOString();
      if (filters.toDate) params.ToDate = new Date(filters.toDate).toISOString();

      const response = await activityService.getAllActivityEntries(params);

      if (response.Success && response.Data) {
        let items = response.Data.Activities || [];
        
        // Filter by search term (client-side search)
        if (searchTerm) {
          items = items.filter((item: ActivityEntry) =>
            item.ActivitySubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ActivityDiscription.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.CurrentLocation.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Filter inactive items
        if (!showInactive) {
          items = items.filter((item: ActivityEntry) => item.IsActive);
        }
        
        setActivities(items);
        setTotalCount(response.Data.TotalRecords || 0);
        setTotalPages(response.Data.TotalPages || 0);
      } else {
        toast.error(response.Message || 'Failed to fetch activities');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch activities');
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [pageNumber, showInactive, filters]);

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPageNumber(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      activityId: '',
      userId: '',
      activitySubject: '',
      isActive: '',
      fromDate: '',
      toDate: '',
    });
    setPageNumber(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {/* <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by subject, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={16} />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-200 text-blue-800 rounded-full">
                  Active
                </span>
              )}
            </button>

            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showInactive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </button>
            
            <button
              onClick={fetchActivities}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activity ID</label>
                <input
                  type="number"
                  value={filters.activityId}
                  onChange={(e) => handleFilterChange('activityId', e.target.value)}
                  placeholder="Enter Activity ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <input
                  type="number"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  placeholder="Enter User ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={filters.activitySubject}
                  onChange={(e) => handleFilterChange('activitySubject', e.target.value)}
                  placeholder="Filter by subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.isActive}
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="datetime-local"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="datetime-local"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div> */}

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">📋</div>
            <p className="text-gray-500 font-medium">No activities found</p>
            <p className="text-gray-400 text-sm">
              {searchTerm || hasActiveFilters 
                ? 'Try adjusting your filters or search term' 
                : 'Create your first activity to get started'}
            </p>
            {(searchTerm || hasActiveFilters) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearFilters();
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4  gap-4">
          {activities.map((activity) => (
            <div
              key={activity.ActivityDetailId}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border-l-4"
              style={{ borderLeftColor: activity.IsActive ? '#22c55e' : '#ef4444' }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                      {activity.ActivitySubject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 font-mono">
                        ID: #{activity.ActivityDetailId}
                      </span>
                      <span className="text-xs text-gray-400">|</span>
                      <span className="text-xs text-gray-500 font-mono">
                        Activity: {activity.ActivityId}
                      </span>
                    </div>
                  </div>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full border flex-shrink-0 ${getStatusColor(activity.IsActive)}`}>
                    {activity.IsActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-[3.5rem]">
                  {activity.ActivityDiscription || 'No description available'}
                </p>
                
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">{activity.CurrentLocation}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <Calendar size={14} className="mr-1 flex-shrink-0" />
                  <span>Created: {formatDate(activity.CreatedAt)}</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(activity.ActivityDetailId)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onEdit(activity)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    {activity.IsActive ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-md">
          <span className="text-sm text-gray-700">
            Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={pageNumber === 1}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm font-medium">
              Page {pageNumber} of {totalPages}
            </span>
            <button
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={pageNumber === totalPages}
              className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityGrid;