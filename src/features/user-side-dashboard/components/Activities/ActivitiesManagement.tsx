import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, FileText, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';

// import ActivityStats from './ActivityStats';
import { Activity } from '@/lib/api/activityService';
import ActivityList from './ActivitiesList';
import ActivityGrid from './ActivityGrid';

const ActivitiesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showImportModal, setShowImportModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddActivity = () => {
    navigate('/user-side/activity/user/create');
  };

  const handleEditActivity = (id: number) => {
    navigate(`/user-side/activity/user/edit/${id}`);
  };

  const handleViewActivity = (id: number) => {
    navigate(`/user-side/activity/user/view/${id}`);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Activities refreshed');
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    handleRefresh();
    toast.success('Activities imported successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-4 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900"> Your Activities</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your activities, track progress, and organize tasks
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>

             
              {/* Add Button */}
              <button
                onClick={handleAddActivity}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Activity</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ActivityStats refreshKey={refreshKey} />
      </div> */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {viewMode === 'list' ? (
          <ActivityList
            key={refreshKey}
            onEdit={handleEditActivity}
            onAdd={handleAddActivity}
            onView={handleViewActivity}
          />
        ) : (
          <ActivityGrid
            key={refreshKey}
            onEdit={handleEditActivity}
            onView={handleViewActivity}
          />
        )}
      </div>

      {/* Import Modal */}
      {/* {showImportModal && (
        <ActivityImport
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )} */}
    </div>
  );
};

export default ActivitiesManagement;