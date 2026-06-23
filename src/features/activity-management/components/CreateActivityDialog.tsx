import React from 'react';
import ActivityDialog from './ActivityDialog';

interface CreateActivityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateActivityDialog: React.FC<CreateActivityDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  return (
    <ActivityDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      mode="create"
    />
  );
};

export default CreateActivityDialog;
