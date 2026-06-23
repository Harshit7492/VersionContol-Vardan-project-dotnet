import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';

const ActivityForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    activityName: '',
    activityDescription: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchActivity(parseInt(id));
    }
  }, [id, isEditMode]);

  const fetchActivity = async (activityId: number) => {
    try {
      const response = await activityService.getActivityById(activityId);
      if (response.Success && response.Data) {
        setFormData({
          activityName: response.Data.activityName || '',
          activityDescription: response.Data.activityDescription || '',
          isActive: response.Data.isActive ?? true, // Default to true if undefined
        });
      } else {
        toast.error(response.Message || 'Failed to fetch activity');
        navigate('/activity');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error fetching activity');
      navigate('/activity');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked, // Explicitly sets true when checked, false when unchecked
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare payload with explicit boolean for isActive
      const payload = {
        activityName: formData.activityName,
        activityDescription: formData.activityDescription,
        isActive: formData.isActive, // This will be true or false
      };

      console.log('Submitting payload:', payload); // For debugging

      if (isEditMode) {
        const response = await activityService.updateActivity({
          activityId: parseInt(id!),
          ...payload,
          updatedByUserId: 1, // Mock user ID
        });
        if (response.Success) {
          toast.success('Activity updated successfully');
          navigate('/activity');
        } else {
          toast.error(response.Message || 'Failed to update activity');
        }
      } else {
        const response = await activityService.addActivity({
          ...payload,
        });
        if (response.Success) {
          toast.success('Activity created successfully');
          navigate('/activity');
        } else {
          toast.error(response.Message || 'Failed to create activity');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Error saving activity');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-6">
      <button
        onClick={() => navigate('/activity')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Activities
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h1 className="text-xl font-bold text-gray-800">
            {isEditMode ? 'Edit Activity' : 'Create New Activity'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode ? 'Update the details of an existing activity.' : 'Fill in the details to create a new activity.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="activityName"
              value={formData.activityName}
              onChange={handleInputChange}
              placeholder="e.g. Code Review"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="activityDescription"
              value={formData.activityDescription}
              onChange={handleInputChange}
              placeholder="Provide a detailed description of the activity..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-y"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-offset-0 transition-colors cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
              Activity is Active
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                When active, this activity can be selected by users.
              </p>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/activity')}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {submitting ? 'Saving...' : 'Save Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;