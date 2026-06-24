import { useState } from 'react';
import ActivityList from './components/ActivityList';
import CreateActivityDialog from './components/CreateActivityDialog';
import EditActivityDialog from './components/EditActivityDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { ProfileDropdown } from '@/components/profile-dropdown';

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
    <div className="min-h-screen bg-background">
      {/* Shared Header */}
      <Header fixed>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-base font-semibold text-foreground">
            Activities
          </h1>

          <ProfileDropdown />
        </div>
      </Header>
      <div className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Activities
            </h2>
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
    </div>
  );
}

export default ActivityHome;