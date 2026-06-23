import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity as ActivityIcon, Calendar, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';
import type { Activity } from '@/lib/api/activityService';

const ActivityDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchActivity(parseInt(id));
    }
  }, [id]);

  const fetchActivity = async (activityId: number) => {
    setLoading(true);
    try {
      const response = await activityService.getActivityById(activityId);
      if (response.Success && response.Data) {
        setActivity(response.Data);
      } else {
        toast.error(response.Message || 'Activity not found');
        navigate('/activity');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error fetching activity');
      console.error('Error fetching activity:', error);
      navigate('/activity');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500">Activity not found</p>
        <button
          onClick={() => navigate('/activity')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/activity')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Activities
      </button>

      {/* Activity Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <ActivityIcon className="h-6 w-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-800">
                {activity.activityName}
              </h1>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  activity.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {activity.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">ID: #{activity.activityId}</p>
          </div>
          <button
            onClick={() => navigate(`/activity/edit/${activity.activityId}`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Edit size={16} />
            Edit
          </button>
        </div>

        <div className="space-y-4">
          {/* Description */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-gray-800">
              {activity.activityDescription || 'No description provided'}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1 text-gray-800">
                {activity.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1 flex items-center gap-2 text-gray-800">
                <Calendar size={14} className="text-gray-400" />
                {formatDate(activity.createdAt)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
              <p className="mt-1 flex items-center gap-2 text-gray-800">
                <Clock size={14} className="text-gray-400" />
                {formatDate(activity.updatedAt)}
              </p>
            </div>
            {activity.createdByUserId && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created By User ID</h3>
                <p className="mt-1 flex items-center gap-2 text-gray-800">
                  User #{activity.createdByUserId}
                </p>
              </div>
            )}
            {activity.updatedByUserId && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Updated By User ID</h3>
                <p className="mt-1 flex items-center gap-2 text-gray-800">
                  User #{activity.updatedByUserId}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailView;
