import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, ChevronDown, Tag, MapPin, Navigation, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';

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

interface UpdateActivityPayload {
  ActivityDetailId: number;
  ActivityId: number;
  ActivitySubject: string;
  ActivityDiscription: string;
  CurrentLocation: string;
  Latitude: number;
  Longitude: number;
}

interface GetAllActivitiesParams {
  pageNumber?: number;
  pageSize?: number;
}

interface PaginatedResponse<T> {
  Activities: T[];
  PageNumber: number;
  PageSize: number;
  TotalRecords: number;
  TotalPages: number;
}

interface BaseResponse<T> {
  Success: boolean;
  Message: string;
  Error: string | null;
  Data: T;
}

const EditActivity: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [activity, setActivity] = useState<ActivityEntry | null>(null);
  const [formData, setFormData] = useState({
    activitySubject: '',
    activityDiscription: '',
    activityType: '',
    currentLocation: '',
    latitude: 0,
    longitude: 0,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Fetch activity types from API
  useEffect(() => {
    const fetchActivityTypes = async () => {
      setLoadingTypes(true);
      try {
        const response = await activityService.getAllActivities({
          pageNumber: 1,
          pageSize: 100,
        });
        
        if (response.Success && response.Data) {
          setActivityTypes(response.Data.Activities || []);
        } else {
          toast.error(response.Message || 'Failed to load activity types');
        }
      } catch (error: any) {
        toast.error(error?.message || 'Error loading activity types');
        console.error('Error fetching activity types:', error);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchActivityTypes();
  }, []);

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) return;
      
      setFetching(true);
      try {
        const response = await activityService.getActivityEntryById(parseInt(id));
        
        if (response.Success && response.Data) {
          const data = response.Data;
          setActivity(data);
          
          // Find the activity type name from ActivityId
          const type = activityTypes.find(t => t.ActivityId === data.ActivityId);
          
          setFormData({
            activitySubject: data.ActivitySubject || '',
            activityDiscription: data.ActivityDiscription || '',
            activityType: type?.ActivityName || '',
            currentLocation: data.CurrentLocation || '',
            latitude: data.Latitude || 0,
            longitude: data.Longitude || 0,
          });
        } else {
          toast.error(response.Message || 'Failed to fetch activity');
          navigate('/activities');
        }
      } catch (error: any) {
        toast.error(error?.message || 'Error fetching activity');
        console.error('Error fetching activity:', error);
        navigate('/activities');
      } finally {
        setFetching(false);
      }
    };

    if (activityTypes.length > 0) {
      fetchActivity();
    }
  }, [id, navigate, activityTypes]);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude,
          longitude,
          currentLocation: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
        setIsFetchingLocation(false);
        toast.success('Location fetched successfully');
      },
      (error) => {
        setIsFetchingLocation(false);
        console.error('Error getting location:', error);
        toast.error('Unable to fetch location. Please enter manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const selectedType = activityTypes.find(type => type.ActivityName === formData.activityType);

  // Get color for activity type based on name
  const getTypeColor = (typeName: string) => {
    const colors: { [key: string]: string } = {
      'Marketing': 'bg-blue-100 text-blue-800',
      'Development': 'bg-purple-100 text-purple-800',
      'Design': 'bg-pink-100 text-pink-800',
      'Research': 'bg-cyan-100 text-cyan-800',
      'Planning': 'bg-amber-100 text-amber-800',
      'Review': 'bg-emerald-100 text-emerald-800',
      'Meeting': 'bg-indigo-100 text-indigo-800',
      'Compliance Request': 'bg-green-100 text-green-800',
      'User Request': 'bg-teal-100 text-teal-800',
      'Project Request': 'bg-orange-100 text-orange-800',
      'Report Request': 'bg-rose-100 text-rose-800',
      'System Request': 'bg-violet-100 text-violet-800',
      'Data Request': 'bg-fuchsia-100 text-fuchsia-800',
      'Vendor Request': 'bg-sky-100 text-sky-800',
    };
    return colors[typeName] || 'bg-gray-100 text-gray-800';
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.activitySubject.trim()) {
      newErrors.activitySubject = 'Activity subject is required';
    } else if (formData.activitySubject.length < 3) {
      newErrors.activitySubject = 'Activity subject must be at least 3 characters';
    } else if (formData.activitySubject.length > 200) {
      newErrors.activitySubject = 'Activity subject must be less than 200 characters';
    }

    if (!formData.activityType) {
      newErrors.activityType = 'Activity type is required';
    }

    if (formData.activityDiscription && formData.activityDiscription.length > 500) {
      newErrors.activityDiscription = 'Description must be less than 500 characters';
    }

    if (!formData.currentLocation.trim()) {
      newErrors.currentLocation = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!id) return;

    setLoading(true);
    try {
      const selectedActivityType = activityTypes.find(type => type.ActivityName === formData.activityType);
      
      const payload: UpdateActivityPayload = {
        ActivityDetailId: parseInt(id),
        ActivityId: selectedActivityType?.ActivityId || activity?.ActivityId || 0,
        ActivitySubject: formData.activitySubject.trim(),
        ActivityDiscription: formData.activityDiscription.trim() || '',
        CurrentLocation: formData.currentLocation.trim(),
        Latitude: formData.latitude,
        Longitude: formData.longitude,
      };

      console.log('Updating payload:', payload);

      const response = await activityService.updateActivityEntry(payload);

      if (response.Success) {
        toast.success('Activity updated successfully');
        navigate('/user-side/activity');
      } else {
        toast.error(response.Message || 'Failed to update activity');
      }
    } catch (error: any) {
      console.error('Full error object:', error);
      
      let errorMessage = 'Error updating activity';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      if (error?.response) {
        console.error('Error response:', error.response);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      // Soft delete by setting IsActive to false
      const response = await activityService.updateActivityEntry({
        ActivityDetailId: parseInt(id),
        ActivityId: activity?.ActivityId || 0,
        ActivitySubject: formData.activitySubject.trim(),
        ActivityDiscription: formData.activityDiscription.trim() || '',
        CurrentLocation: formData.currentLocation.trim(),
        Latitude: formData.latitude,
        Longitude: formData.longitude,
      });

      if (response.Success) {
        toast.success('Activity deleted successfully');
        navigate('/user-side/activity');
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

  const handleCancel = () => {
    if (formData.activitySubject !== activity?.ActivitySubject || 
        formData.activityDiscription !== activity?.ActivityDiscription ||
        formData.currentLocation !== activity?.CurrentLocation ||
        formData.latitude !== activity?.Latitude ||
        formData.longitude !== activity?.Longitude) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/user-side/activity');
      }
    } else {
      navigate('/user-side/activity');
    }
  };

  const handleTypeSelect = (type: ActivityType) => {
    setFormData({ ...formData, activityType: type.ActivityName });
    setShowTypeDropdown(false);
    if (errors.activityType) {
      setErrors({ ...errors, activityType: '' });
    }
  };

  if (fetching || loadingTypes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Activity</h1>
              <p className="text-sm text-gray-500 mt-1">
                Update activity details, type, and location
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Activity Type Dropdown */}
            <div>
              <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between ${
                    errors.activityType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingTypes}
                >
                  <div className="flex items-center gap-2">
                    {loadingTypes ? (
                      <span className="text-gray-400">Loading types...</span>
                    ) : selectedType ? (
                      <>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedType.ActivityName)}`}>
                          {selectedType.ActivityName}
                        </span>
                        <span className="text-sm text-gray-500">{selectedType.ActivityDescription}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Select activity type...</span>
                    )}
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showTypeDropdown && !loadingTypes && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="p-2">
                      {activityTypes.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          No activity types available
                        </div>
                      ) : (
                        activityTypes.map((type) => (
                          <button
                            key={type.ActivityId}
                            type="button"
                            onClick={() => handleTypeSelect(type)}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                              formData.activityType === type.ActivityName ? 'bg-blue-50' : ''
                            }`}
                          >
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(type.ActivityName)}`}>
                              {type.ActivityName}
                            </span>
                            <span className="text-sm text-gray-600">{type.ActivityDescription}</span>
                            {!type.IsActive && (
                              <span className="text-xs text-red-500 ml-auto">Inactive</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.activityType && (
                <p className="mt-1 text-sm text-red-500">{errors.activityType}</p>
              )}
            </div>

            {/* Activity Subject */}
            <div>
              <label htmlFor="activitySubject" className="block text-sm font-medium text-gray-700 mb-1">
                Activity Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="activitySubject"
                value={formData.activitySubject}
                onChange={(e) => {
                  setFormData({ ...formData, activitySubject: e.target.value });
                  if (errors.activitySubject) {
                    setErrors({ ...errors, activitySubject: '' });
                  }
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.activitySubject ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter activity subject"
                maxLength={200}
              />
              {errors.activitySubject && (
                <p className="mt-1 text-sm text-red-500">{errors.activitySubject}</p>
              )}
              <div className="mt-1 text-xs text-gray-400 text-right">
                {formData.activitySubject.length}/200
              </div>
            </div>

            {/* Activity Description */}
            <div>
              <label htmlFor="activityDiscription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="activityDiscription"
                value={formData.activityDiscription}
                onChange={(e) => {
                  setFormData({ ...formData, activityDiscription: e.target.value });
                  if (errors.activityDiscription) {
                    setErrors({ ...errors, activityDiscription: '' });
                  }
                }}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.activityDiscription ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter activity description (optional)"
                maxLength={500}
              />
              {errors.activityDiscription && (
                <p className="mt-1 text-sm text-red-500">{errors.activityDiscription}</p>
              )}
              <div className="mt-1 text-xs text-gray-400 text-right">
                {formData.activityDiscription.length}/500
              </div>
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="currentLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Current Location <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    id="currentLocation"
                    value={formData.currentLocation}
                    onChange={(e) => {
                      setFormData({ ...formData, currentLocation: e.target.value });
                      if (errors.currentLocation) {
                        setErrors({ ...errors, currentLocation: '' });
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.currentLocation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter location or use 'Get Current Location' button"
                  />
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isFetchingLocation}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  {isFetchingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Navigation size={16} />
                      Get Location
                    </>
                  )}
                </button>
              </div>
              {errors.currentLocation && (
                <p className="mt-1 text-sm text-red-500">{errors.currentLocation}</p>
              )}
              
              {/* Latitude and Longitude Display */}
              {(formData.latitude !== 0 || formData.longitude !== 0) && (
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    Lat: {formData.latitude.toFixed(6)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    Long: {formData.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>

            {/* Selected Type Preview */}
            {selectedType && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Tag size={16} className="text-blue-600" />
                <span className="text-sm text-blue-700">
                  Editing a <span className="font-semibold">{selectedType.ActivityName}</span> type activity
                </span>
                <span className="text-xs text-blue-600 ml-auto">
                  {selectedType.ActivityDescription}
                </span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading || loadingTypes}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditActivity;