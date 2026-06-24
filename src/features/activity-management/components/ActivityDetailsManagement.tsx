

import React, { useState, useEffect, useCallback } from 'react';
import {
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
  FirstName?: string;
  LastName?: string;
  LoginTime?: string;
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

// ============================================
// Address Component with Reverse Geocoding
// ============================================

// Cache for addresses to avoid repeated API calls
const addressCache = new Map<string, string>();

// Function to get address from coordinates using Nominatim (OpenStreetMap)
const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  const cacheKey = `${lat},${lng}`;
  
  // Check cache first
  if (addressCache.has(cacheKey)) {
    return addressCache.get(cacheKey)!;
  }

  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ActivityManagementApp/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    
    let address = '';
    if (data && data.display_name) {
      const addressParts = data.display_name.split(',');
      address = addressParts.slice(0, 4).join(',').trim();
    } else {
      address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    
    addressCache.set(cacheKey, address);
    return address;
  } catch (error) {
    console.error('Error fetching address:', error);
    const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    addressCache.set(cacheKey, fallback);
    return fallback;
  }
};

// Component to display address with loading state
const AddressDisplay: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (lat === 0 && lng === 0) {
      setAddress('No location data');
      setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      setLoading(true);
      const result = await getAddressFromCoordinates(lat, lng);
      setAddress(result);
      setLoading(false);
    };

    fetchAddress();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <MapPin size={12} className="animate-pulse" />
        <span>Loading address...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <MapPin size={12} className="flex-shrink-0 text-blue-500" />
      <span className="truncate" title={address}>
        {address}
      </span>
    </div>
  );
};

// ============================================
// Main Component
// ============================================

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
        UsageType: "Admin"
      });
      
      const data = response.Data;
      const isSuccess = response.Success;
      
      if (isSuccess && data) {
        const activities = data.Activities || [];
        
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
        console.warn('Failed to fetch activities:', response.Message);
      }
    } catch (error: any) {
      console.error('Error fetching activity types:', error);
      toast.error('Failed to load activity types');
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  // Fetch activity entries with filters
  const fetchActivityEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        PageNumber: pageNumber,
        PageSize: pageSize,
        UsageType: "Admin"
      };

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

      console.log('Fetching with params:', params);

      const response = await activityService.getAllActivityEntries(params);

      console.log('API Response:', response);

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
  }, []);

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
    setTimeout(() => fetchActivityEntries(), 0);
  };

  // Apply filters
  const applyFilters = () => {
    setPageNumber(1);
    fetchActivityEntries();
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

 

  const getUserFullName = (detail: ActivityEntry): string => {
    if (detail.FirstName && detail.LastName) {
      return `${detail.FirstName} ${detail.LastName}`;
    }
    return `User ${detail.ActivityId}`;
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
                    
                    {/* User Full Name - Updated to show FirstName and LastName */}
                    <div className='mb-1 flex items-center gap-2 text-sm text-gray-600'>
                      <User size={14} className='flex-shrink-0 text-blue-500' />
                      <span className='truncate font-medium text-gray-700'>
                        {getUserFullName(detail)}
                      </span>
                    </div>
                    
                    <div className='mb-1 flex items-center gap-2 text-sm text-gray-600'>
                      <span className='font-medium text-gray-700'>Subject:</span>
                      <span className='truncate'>{detail.ActivitySubject}</span>
                    </div>
                    
                    {/* Show CurrentLocation if available */}
                    {detail.CurrentLocation && (
                      <div className='mb-1 flex items-center gap-2 text-sm text-gray-600'>
                        <MapPin size={14} className='flex-shrink-0' />
                        <span className='truncate'>{detail.CurrentLocation}</span>
                      </div>
                    )}
                    
                    {/* Show address from coordinates if available */}
                    {(detail.Latitude !== 0 || detail.Longitude !== 0) && (
                      <div className='mt-1'>
                        <AddressDisplay lat={detail.Latitude} lng={detail.Longitude} />
                      </div>
                    )}
                    
                    <div className='mt-2 flex items-center gap-2 text-sm text-gray-600'>
                      <Clock size={14} className='flex-shrink-0' />
                      <span>Created: {formatDate(detail.CreatedAt)}</span>
                    </div>
                    
                    {detail.ActivityDiscription && (
                      <p className='mt-2 border-t pt-2 text-sm text-gray-600 line-clamp-2'>
                        {detail.ActivityDiscription}
                      </p>
                    )}
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