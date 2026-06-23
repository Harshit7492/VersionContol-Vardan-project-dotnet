import React, { useState, useEffect } from 'react';
import { Edit, Trash2, RefreshCw, Search, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import activityService, { Activity } from '@/lib/api/activityService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ActivityListProps {
  onEdit: (activity: Activity) => void;
  onAdd: () => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ onEdit, onAdd }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const userId = 1; // Get from auth context

  // Fetch activities
  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await activityService.getAllActivities({
        pageNumber,
        pageSize,
      });

      const res: any = response;
      const isSuccess = res.success !== undefined ? res.success : res.Success;
      const data = res.data || res.Data;
      const message = res.message || res.Message;

      if (isSuccess && data) {
        let items = (data.items || data.Activities || []).map((item: any) => ({
          activityId: item.activityId || item.ActivityId,
          activityName: item.activityName || item.ActivityName,
          activityDescription: item.activityDescription || item.ActivityDescription,
          isActive: item.isActive !== undefined ? item.isActive : item.IsActive,
          createdByUserId: item.createdByUserId || item.CreatedByUserId,
          createdDateTime: item.createdAt || item.CreatedAt || item.CreatedDateTime,
          updatedByUserId: item.updatedByUserId || item.UpdatedByUserId,
          updatedDateTime: item.updatedAt || item.UpdatedAt || item.UpdatedDateTime,
        }));

        if (!showInactive) {
          items = items.filter((item: any) => item.isActive);
        }

        setActivities(items);
        setTotalCount(data.totalCount || data.TotalRecords || 0);
        setTotalPages(data.totalPages || data.TotalPages || 0);
      } else {
        toast.error(message || 'Failed to fetch activities');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error fetching activities');
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [pageNumber, showInactive]);

  // Handle delete
  const handleDelete = async () => {
    if (!activityToDelete) return;

    setLoading(true);
    try {
      const response = await activityService.updateActivity({
        activityId: activityToDelete.activityId,
        isActive: false,
        updatedByUserId: userId,
      });

      const res: any = response;
      const isSuccess = res.success !== undefined ? res.success : res.Success;
      const message = res.message || res.Message;

      if (isSuccess) {
        toast.success('Activity deleted successfully');
        setDeleteDialogOpen(false);
        setActivityToDelete(null);
        fetchActivities();
      } else {
        toast.error(message || 'Failed to delete activity');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error deleting activity');
      console.error('Error deleting activity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (activity: Activity) => {
    setLoading(true);
    try {
      const response = await activityService.updateActivity({
        activityId: activity.activityId,
        isActive: !activity.isActive,
        updatedByUserId: userId,
      });

      const res: any = response;
      const isSuccess = res.success !== undefined ? res.success : res.Success;
      const message = res.message || res.Message;

      if (isSuccess) {
        toast.success(`Activity ${activity.isActive ? 'deactivated' : 'activated'} successfully`);
        fetchActivities();
      } else {
        toast.error(message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Error updating status');
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = (id: number) => {
    window.location.href = `/activity/view-activity-details/${id}`;
  };

  // Filter activities based on search
  const filteredActivities = activities.filter((activity) =>
    activity.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activity.activityDescription?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div> */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* <Button
            variant={showInactive ? 'default' : 'outline'}
            onClick={() => setShowInactive(!showInactive)}
            size="sm"
          >
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </Button> */}
          {/* <Button
            variant="outline"
            onClick={fetchActivities}
            disabled={loading}
            size="sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin mr-2' : 'mr-2'} />
            Refresh
          </Button> */}
         
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No activities found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.activityId}>
                    <TableCell className="font-medium">{activity.activityId}</TableCell>
                    <TableCell>{activity.activityName}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {activity.activityDescription || '-'}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.isActive)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                    
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(activity)}
                          className="text-blue-600"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Button> 
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={pageNumber === 1}
              size="sm"
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm">
              Page {pageNumber} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={pageNumber === totalPages}
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the activity "{activityToDelete?.activityName}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivityList;