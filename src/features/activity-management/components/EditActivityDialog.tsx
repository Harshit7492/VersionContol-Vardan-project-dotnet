import React from 'react';
import ActivityDialog from './ActivityDialog';
import { Activity } from '@/lib/api/activityService';

interface EditActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activity: Activity | null;
}

const EditActivityDialog: React.FC<EditActivityDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  activity,
}) => {
  return (
    <ActivityDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      mode="edit"
      activity={activity}
    />
  );
};

export default EditActivityDialog;