import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import activityService from '@/lib/api/activityService';

interface ActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activity?: any | null;
  mode: 'create' | 'edit';
}

const ActivityDialog: React.FC<ActivityDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activity,
  mode,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    activityName: '',
    activityDescription: '',
    isActive: true,
  });

  const isEditMode = mode === 'edit';

  // Reset form and load data when dialog opens
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && activity) {
        setFormData({
          activityName: activity.activityName || '',
          activityDescription: activity.activityDescription || '',
          isActive: activity.isActive ?? true,
        });
      } else {
        setFormData({
          activityName: '',
          activityDescription: '',
          isActive: true,
        });
      }
    }
  }, [isOpen, isEditMode, activity]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        activityName: formData.activityName.trim(),
        activityDescription: formData.activityDescription.trim(),
        isActive: formData.isActive,
      };

      console.log('Submitting payload:', payload);

      if (isEditMode && activity) {
        // Update activity
        const response = await activityService.updateActivity({
          activityId: activity.activityId,
          ...payload,
          updatedByUserId: 1, // Replace with actual user ID from auth
        });

        if (response.success) {
          toast.success('Activity updated successfully');
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || 'Failed to update activity');
        }
      } else {
        // Create activity
        const response = await activityService.addActivity(payload);

        if (response.success) {
          toast.success('Activity created successfully');
          onSuccess();
          onClose();
        } else {
          toast.error(response.message || 'Failed to create activity');
        }
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error saving activity');
      console.error('Error saving activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const dialogTitle = isEditMode ? 'Edit Activity' : 'Create New Activity';
  const dialogDescription = isEditMode
    ? 'Update the details of the activity.'
    : 'Fill in the details to create a new activity.';
  const submitButtonText = isEditMode ? 'Update Activity' : 'Create Activity';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="activityName" className="text-sm font-medium">
              Activity Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="activityName"
              name="activityName"
              type="text"
              value={formData.activityName}
              onChange={handleInputChange}
              placeholder="e.g. Code Review"
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activityDescription" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="activityDescription"
              name="activityDescription"
              value={formData.activityDescription}
              onChange={handleInputChange}
              placeholder="Provide a detailed description of the activity..."
              rows={4}
              disabled={loading}
              className="w-full resize-y"
            />
          </div>

          <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleCheckboxChange}
              disabled={loading}
              className="h-5 w-5"
            />
            <div className="space-y-0.5">
              <Label
                htmlFor="isActive"
                className="text-sm font-medium cursor-pointer"
              >
                Activity is Active
              </Label>
              <p className="text-xs text-gray-500">
                When active, this activity can be selected by users.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDialog;