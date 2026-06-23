import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, RefreshCw, Search, Eye, Download, Filter, Activity, Plus, Calendar, X } from 'lucide-react';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';

interface ActivityListProps {
  onEdit: (id: number) => void;
  onAdd: () => void;
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

const ActivityList: React.FC<ActivityListProps> = ({ onEdit, onAdd, onView }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState<'subject' | 'id' | 'status' | 'date'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter states
  const [filters, setFilters] = useState({
    activityId: '',
    userId: '',
    activitySubject: '',
    isActive: '',
    fromDate: '',
    toDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch activities with filters
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
      toast.error(error?.message || 'Error fetching activities');
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

  // Handle delete
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    setLoading(true);
    try {
      // Using update activity to deactivate
      const response = await activityService.updateActivity({
        activityId: id,
        isActive: false,
        updatedByUserId: 1, // Get from auth context
      });

      if (response.Success) {
        toast.success('Activity deleted successfully');
        fetchActivities();
      } else {
        toast.error(response.Message || 'Failed to delete activity');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error deleting activity');
      console.error('Error deleting activity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (activity: ActivityEntry) => {
    setLoading(true);
    try {
      const response = await activityService.updateActivity({
        activityId: activity.ActivityId,
        isActive: !activity.IsActive,
        updatedByUserId: 1, // Get from auth context
      });

      if (response.Success) {
        toast.success(`Activity ${activity.IsActive ? 'deactivated' : 'activated'} successfully`);
        fetchActivities();
      } else {
        toast.error(response.Message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error updating status');
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle export
  const handleExport = () => {
    if (activities.length === 0) {
      toast.warning('No activities to export');
      return;
    }

    const csvData = activities.map(a => ({
      ID: a.ActivityDetailId,
      ActivityId: a.ActivityId,
      Subject: a.ActivitySubject,
      Description: a.ActivityDiscription || '',
      Location: a.CurrentLocation,
      Latitude: a.Latitude,
      Longitude: a.Longitude,
      Status: a.IsActive ? 'Active' : 'Inactive',
      CreatedAt: new Date(a.CreatedAt).toLocaleString(),
    }));
    
    const headers = Object.keys(csvData[0]);
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Activities exported successfully');
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sort activities
  const sortedActivities = [...activities].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'subject':
        comparison = a.ActivitySubject.localeCompare(b.ActivitySubject);
        break;
      case 'id':
        comparison = a.ActivityDetailId - b.ActivityDetailId;
        break;
      case 'status':
        comparison = (a.IsActive === b.IsActive) ? 0 : a.IsActive ? -1 : 1;
        break;
      case 'date':
        comparison = new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime();
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className=" ">
        {/* <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search activities by subject, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={16} />
              Filters
              {Object.values(filters).some(v => v !== '') && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-200 text-blue-800 rounded-full">
                  Active
                </span>
              )}
            </button>

            
            
            
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>
        </div> */}

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : sortedActivities.length === 0 ? (
          <div className="text-center py-10">
            <div className="flex flex-col items-center gap-4">
              <Activity size={48} className="text-gray-300" />
              <div>
                <p className="text-gray-500 font-medium">No activities found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || Object.values(filters).some(v => v !== '') 
                    ? 'Try adjusting your filters or search term' 
                    : 'Click "Add New" to create your first activity'}
                </p>
              </div>
              {(searchTerm || Object.values(filters).some(v => v !== '')) && (
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedActivities.map((activity) => (
                  <tr key={activity.ActivityDetailId} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-4 text-sm text-gray-900 font-mono">#{activity.ActivityDetailId}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {activity.ActivitySubject}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {activity.ActivityDiscription || 'No description'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500">
                        <div className="truncate max-w-[120px]">{activity.CurrentLocation}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(activity.IsActive)}`}>
                        {activity.IsActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(activity.CreatedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(activity.ActivityId)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => onView(activity.ActivityDetailId)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} results
            </span>
          </div>
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

export default ActivityList;