import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Info, 
  CheckCircle, 
  Clock,
  FileText,
  Tag,
  AlertCircle,
  Copy,
  MapPin,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';
import { Header } from '@/components/layout/header';

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

const ViewActivity: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!id) {
        setError('Activity ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await activityService.getActivityEntryById(parseInt(id));
        
        if (response.Success && response.Data) {
          setActivity(response.Data);
        } else {
          setError(response.Message || 'Failed to fetch activity details');
          toast.error(response.Message || 'Failed to fetch activity details');
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.Message || error?.message || 'Error fetching activity details';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error fetching activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header fixed>
          <div>
            <h1 className="text-base font-semibold text-foreground">Activity Details</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">View activity information</p>
          </div>
        </Header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-500 mt-4">Loading activity details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header fixed>
          <div>
            <h1 className="text-base font-semibold text-foreground">Activity Details</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">View activity information</p>
          </div>
        </Header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle size={48} className="text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Activity</h2>
              <p className="text-gray-500 mb-4">{error || 'Activity not found'}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Header */}
      <Header fixed>
        <div>
          <h1 className="text-base font-semibold text-foreground">Activity Details</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">View activity information</p>
        </div>
      </Header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{activity.ActivitySubject}</h1>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Detail ID: #{activity.ActivityDetailId} • Activity ID: {activity.ActivityId} • Created {formatDateShort(activity.CreatedAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Badge */}
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  activity.IsActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {activity.IsActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Activity Detail ID</p>
                <p className="text-sm font-semibold text-gray-900">#{activity.ActivityDetailId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-purple-600 bg-purple-50 p-2 rounded-lg">
                <Tag size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Activity ID</p>
                <p className="text-sm font-semibold text-gray-900">{activity.ActivityId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                  {activity.CurrentLocation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`px-4 py-3 rounded-lg ${
              activity.IsActive 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {activity.IsActive ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-red-600" size={20} />
                )}
                <span className={`font-medium ${
                  activity.IsActive ? 'text-green-700' : 'text-red-700'
                }`}>
                  {activity.IsActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500 ml-2">
                  Activity is currently {activity.IsActive ? 'available for use' : 'not available'}
                </span>
              </div>
            </div>

            {/* Description */}
            {activity.ActivityDiscription && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-600 whitespace-pre-wrap">{activity.ActivityDiscription}</p>
                </div>
              </div>
            )}

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Current Location</label>
                  <p className="text-sm text-gray-900 mt-1">{activity.CurrentLocation}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Coordinates</label>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-sm text-gray-900">
                      Latitude: {activity.Latitude.toFixed(6)}
                    </p>
                    <p className="text-sm text-gray-900">
                      Longitude: {activity.Longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>Created: {formatDate(activity.CreatedAt)}</span>
                </div>
                {activity.UpdatedAt && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>Last Updated: {formatDate(activity.UpdatedAt)}</span>
                  </div>
                )}
                {!activity.UpdatedAt && (
                  <div className="flex items-center gap-2">
                    <Info size={16} className="text-gray-400" />
                    <span>Not updated yet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(`/user-side/activity/user/edit/${activity.ActivityDetailId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                Edit Activity
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(activity, null, 2));
                  toast.success('Activity data copied to clipboard');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy size={16} />
                Copy Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewActivity;