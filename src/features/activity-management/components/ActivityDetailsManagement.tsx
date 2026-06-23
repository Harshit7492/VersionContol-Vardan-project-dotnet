
import React, { useState, useEffect, useCallback } from 'react';
import {
  Edit,
  Trash2,
  MapPin,
  Clock,
  User,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import activityService from '@/lib/api/activityService';
import ActivityDetailsFilter, { Filters } from './ActivityDetailsFilter';
import { userService } from '@/lib/api/userService';

// Types and Interfaces

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

interface ActivityType {
  ActivityId: number;
  ActivityName: string;
  ActivityDescription: string;
  IsActive: boolean;
  CreatedAt: string;
  CreatedByUserId: number | null;
  UpdatedAt: string | null;
  UpdatedByUserId: number | null;
}

interface User {
  UserID: number;
  FirstName: string;
  LastName: string;
  strEmail: string;
  IsActive: number;
  RoleId: number;
  CreatedByUserId: number;
  Password?: string;
}

const ActivityDetailsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [activityDetails, setActivityDetails] = useState<ActivityEntry[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    activityId: '',
    userId: '',
    isActive: '',
    fromDate: '',
    toDate: '',
  });
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await userService.getUsers();
      
      const isSuccess = response.Issuccess !== undefined ? response.Issuccess : response.success;
      
      if (isSuccess && response.response) {
        setUsers(response.response);
        console.log('Fetched users:', response.response);
      } else {
        console.warn('Failed to fetch users:', response.message);
        toast.error('Failed to load users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Fetch activity types
  const fetchActivityTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const response = await activityService.getAllActivities({
        pageNumber: 1,
        pageSize: 100,
      });
      
      const data =  response.Data;
      const isSuccess = response.Success;
      
      if (isSuccess && data) {
        const activities =  data.Activities || [];
        
        const mappedActivities = activities.map((item: any) => ({
          ActivityId: item.activityId || item.ActivityId,
          ActivityName: item.activityName || item.ActivityName,
          ActivityDescription: item.activityDescription || item.ActivityDescription || '',
          IsActive: item.isActive !== undefined ? item.isActive : item.IsActive,
          CreatedAt: item.createdAt || item.CreatedAt || new Date().toISOString(),
          CreatedByUserId: item.createdByUserId || item.CreatedByUserId || null,
          UpdatedAt: item.updatedAt || item.UpdatedAt || null,
          UpdatedByUserId: item.updatedByUserId || item.UpdatedByUserId || null,
        }));
        
        setActivityTypes(mappedActivities);
        console.log('Fetched activity types:', mappedActivities);
      } else {
        console.warn('Failed to fetch activities:',  response.Message);
      }
    } catch (error: any) {
      console.error('Error fetching activity types:', error);
      toast.error('Failed to load activity types');
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  // Fetch activity entries with filters - FIXED
  const fetchActivityEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build filter params with proper casing
      const params: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
      };

      // Add filters if they have values
      if (filters.activityId && filters.activityId !== '') {
        params.ActivityId = parseInt(filters.activityId);
      }
      if (filters.userId && filters.userId !== '') {
        params.UserId = parseInt(filters.userId);
      }
      if (filters.isActive !== '') {
        params.IsActive = filters.isActive === 'true';
      }
      if (filters.fromDate && filters.fromDate !== '') {
        params.FromDate = new Date(filters.fromDate).toISOString();
      }
      if (filters.toDate && filters.toDate !== '') {
        params.ToDate = new Date(filters.toDate).toISOString();
      }

      console.log('Fetching with params:', params); // Debug log

      const response = await activityService.getAllActivityEntries(params);

      console.log('API Response:', response); // Debug log

      if (response.Success) {
        setActivityDetails(response.Data.Activities || []);
        setTotalCount(response.Data.TotalRecords || 0);
        setTotalPages(response.Data.TotalPages || 0);
      } else {
        const errorMsg = 'Failed to fetch activity entries';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.Message || error?.message || 'Error fetching activity entries';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching activity entries:', error);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchActivityTypes();
    fetchActivityEntries();
  }, []); // Run only once on mount

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPageNumber(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      activityId: '',
      userId: '',
      isActive: '',
      fromDate: '',
      toDate: '',
    });
    setPageNumber(1);
    // Auto-apply after clearing filters
    setTimeout(() => fetchActivityEntries(), 0);
  };

  // Apply filters (refresh data)
  const applyFilters = () => {
    setPageNumber(1);
    // Fetch with current filters
    fetchActivityEntries();
  };

  // Handle delete (soft delete)
  const handleDelete = async (detailId: number, subject: string) => {
    if (!window.confirm(`Are you sure you want to delete activity "${subject}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const detail = activityDetails.find(d => d.ActivityDetailId === detailId);
      if (!detail) {
        toast.error('Activity not found');
        return;
      }

      const response = await activityService.updateActivityEntry({
        ActivityDetailId: detailId,
        ActivityId: detail.ActivityId,
        ActivitySubject: detail.ActivitySubject,
        ActivityDiscription: detail.ActivityDiscription || '',
        CurrentLocation: detail.CurrentLocation || '',
        Latitude: detail.Latitude,
        Longitude: detail.Longitude,
      });

      if (response.Success) {
        toast.success('Activity deleted successfully');
        fetchActivityEntries();
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
  const handleToggleStatus = async (detail: ActivityEntry) => {
    setLoading(true);
    try {
      const response = await activityService.updateActivityEntry({
        ActivityDetailId: detail.ActivityDetailId,
        ActivityId: detail.ActivityId,
        ActivitySubject: detail.ActivitySubject,
        ActivityDiscription: detail.ActivityDiscription || '',
        CurrentLocation: detail.CurrentLocation || '',
        Latitude: detail.Latitude,
        Longitude: detail.Longitude,
      });

      if (response.Success) {
        toast.success(`Activity ${detail.IsActive ? 'deactivated' : 'activated'} successfully`);
        fetchActivityEntries();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error updating status');
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getActivityName = (activityId: number): string => {
    const activity = activityTypes.find((a) => a.ActivityId === activityId);
    return activity ? activity.ActivityName : `Activity ${activityId}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>User Activity Details</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Track and manage all user activities
          </p>
        </div>
      </div>

      {/* Filter Component */}
      <ActivityDetailsFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={applyFilters}
        loading={loading}
        totalCount={totalCount}
        activities={activityTypes.map(type => ({
          activityId: type.ActivityId,
          activityName: type.ActivityName,
        }))}
        users={users.map(user => ({
          userId: user.UserID,
          firstName: user.FirstName,
          lastName: user.LastName,
          strEmail: user.strEmail,
        }))}
        loadingActivities={loadingTypes}
        loadingUsers={loadingUsers}
      />

      {/* Activity Details Cards */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Loading activities...</span>
        </div>
      ) : error ? (
        <div className='rounded-lg bg-white p-8 text-center shadow-md border border-red-200'>
          <AlertCircle size={48} className='text-red-500 mx-auto mb-4' />
          <p className='text-red-600 font-medium'>{error}</p>
          <button
            onClick={() => fetchActivityEntries()}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            Try Again
          </button>
        </div>
      ) : activityDetails.length === 0 ? (
        <div className='rounded-lg bg-white p-8 text-center shadow-md border border-gray-200'>
          <Activity size={48} className='text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 font-medium'>No activity details found</p>
          <p className='text-sm text-gray-400 mt-1'>
            {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first activity to get started'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className='mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium'
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {activityDetails.map((detail) => (
              <div
                key={detail.ActivityDetailId}
                className='rounded-lg bg-white p-4 shadow-md border border-gray-200 transition-shadow hover:shadow-lg cursor-pointer'
                onClick={() => navigate(`/activity/view-detailed-activity-by-admin/${detail.ActivityDetailId}`)}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    <div className='mb-2 flex items-center gap-2 flex-wrap'>
                      <Activity size={16} className='text-blue-500 flex-shrink-0' />
                      <h3 className='font-semibold text-gray-800 truncate'>
                        {getActivityName(detail.ActivityId)}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          detail.IsActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {detail.IsActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className='mb-1 flex items-center gap-2 text-sm text-gray-600'>
                      <User size={14} className='flex-shrink-0' />
                      <span className='truncate'>User ID: {detail.ActivityId}</span>
                    </div>
                    
                    <div className='mb-1 flex items-center gap-2 text-sm text-gray-600'>
                      <span className='font-medium text-gray-700'>Subject:</span>
                      <span className='truncate'>{detail.ActivitySubject}</span>
                    </div>
                    
                    {detail.CurrentLocation && (
                      <div className='mb-1 flex items-center gap-2 text-sm text-gray-600'>
                        <MapPin size={14} className='flex-shrink-0' />
                        <span className='truncate'>{detail.CurrentLocation}</span>
                      </div>
                    )}
                    
                    {(detail.Latitude !== 0 || detail.Longitude !== 0) && (
                      <div className='text-xs text-gray-500'>
                        📍 {detail.Latitude.toFixed(4)}, {detail.Longitude.toFixed(4)}
                      </div>
                    )}
                    
                    <div className='mt-2 flex items-center gap-2 text-sm text-gray-600'>
                      <Clock size={14} className='flex-shrink-0' />
                      <span>{formatDate(detail.CreatedAt)}</span>
                    </div>
                    
                    {detail.ActivityDiscription && (
                      <p className='mt-2 border-t pt-2 text-sm text-gray-600 line-clamp-2'>
                        {detail.ActivityDiscription}
                      </p>
                    )}
                  </div>
                  
                  <div className='ml-2 flex flex-col gap-2 flex-shrink-0'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/activity/edit-activity/${detail.ActivityDetailId}`);
                      }}
                      className='rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50'
                      title='Edit'
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(detail);
                      }}
                      className={`rounded-lg p-1.5 transition-colors ${
                        detail.IsActive
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={detail.IsActive ? 'Deactivate' : 'Activate'}
                    >
                      {detail.IsActive ? (
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636' />
                        </svg>
                      ) : (
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(detail.ActivityDetailId, detail.ActivitySubject);
                      }}
                      className='rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50'
                      title='Delete'
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-6 flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-md border border-gray-200'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-700'>
                  Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} results
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setPageNumber(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  className='px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
                >
                  Previous
                </button>
                <span className='px-3 py-1 text-sm font-medium'>
                  Page {pageNumber} of {totalPages}
                </span>
                <button
                  onClick={() => setPageNumber(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                  className='px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityDetailsManagement;