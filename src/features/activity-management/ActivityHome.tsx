import React, { useState } from 'react';
import ActivityList from './components/ActivityList';
import CreateActivityDialog from './components/CreateActivityDialog';
import EditActivityDialog from './components/EditActivityDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function ActivityHome() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);

  const handleEdit = (activity: any) => {
    setSelectedActivity(activity);
    setIsEditDialogOpen(true);
  };

  const handleAdd = () => {
    setIsCreateDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedActivity(null);

    // Optional: trigger refresh of ActivityList here
    window.dispatchEvent(new Event('activity-updated'));
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Activities
          </h1>
          <p className="text-sm text-gray-500">
            Manage your system activities
          </p>
        </div>

        <Button onClick={handleAdd} size="sm">
          <Plus size={16} className="mr-2" />
          Add New
        </Button>
      </div>

      <ActivityList
        onEdit={handleEdit}
        onAdd={handleAdd}
      />

      <CreateActivityDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleDialogSuccess}
      />

      <EditActivityDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedActivity(null);
        }}
        onSuccess={handleDialogSuccess}
        activity={selectedActivity}
      />
    </div>
  );
}

export default ActivityHome;