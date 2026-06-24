import React, { useState, useEffect } from 'react';
import { Edit, Eye, Activity} from 'lucide-react';
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

const ActivityList: React.FC<ActivityListProps> = ({ onEdit, onView }) => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    activityId: '',
    userId: '',
    activitySubject: '',
    isActive: '',
    fromDate: '',
    toDate: '',
  });

  // Fetch activities with filters
  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Build filter params
      const params: any = {
        pageNumber,
        pageSize,
        UsageType : "User"
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
        // if (searchTerm) {
        //   items = items.filter((item: ActivityEntry) =>
        //     item.ActivitySubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        //     item.ActivityDiscription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        //     item.CurrentLocation.toLowerCase().includes(searchTerm.toLowerCase())
        //   );
        // }
        
        // Filter inactive items
       
        
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
  }, [pageNumber, filters]);

  // Handle filter change

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
  const sortedActivities = [...activities]
  

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className=" ">
    
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