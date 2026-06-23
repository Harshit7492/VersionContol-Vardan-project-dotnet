import { promises } from 'node:dns';
import apiClient from './apiClient';

export interface Activity {
  activityId: number;
  activityName: string;
  activityDescription?: string;
  isActive: boolean;
  createdAt?: string;
  createdByUserId?: number;
  updatedAt?: string;
  updatedByUserId?: number;
}

export interface AddActivityRequest {
  activityName: string;
  activityDescription?: string;
  isActive: boolean;
}

export interface UpdateActivityRequest {
  activityId: number;
  activityName?: string;
  activityDescription?: string;
  isActive?: boolean;
  updatedByUserId: number;
}

export interface GetAllActivitiesParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface BaseResponse<T = any> {
  Success: boolean;
  Message: string;
  Error?: string;
  Data?: T;
}

export interface PaginatedResponse<T> {
  Activities: never[];
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const activityService = {
  // Add Activity
  addActivity: async (data: AddActivityRequest): Promise<BaseResponse<Activity>> => {
    const response = await apiClient.post('/api/Activity/add-activity', data);
    return response.data;
  },

  // Update Activity
  updateActivity: async (data: UpdateActivityRequest): Promise<BaseResponse<Activity>> => {
    const response = await apiClient.put('/api/Activity/update-activity', data);
    return response.data;
  },

  // Get Activity by ID
  getActivityById: async (activityId: number): Promise<BaseResponse<Activity>> => {
    const response = await apiClient.get(`/api/Activity/get-activity-by-id`, {
      params: { activityId },
    });
    return response.data;
  },

  // Get All Activities (Paginated)
  getAllActivities: async (params: GetAllActivitiesParams = {}): Promise<BaseResponse<PaginatedResponse<Activity>>> => {
    const response = await apiClient.get('/api/Activity/get-all-activities', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 100,
      },
    });
    return response.data;
  },

// ------------------------------------------user Side---------------------------------------

createActivityEntry: async (data: any): Promise<BaseResponse<any>> => {
    const response = await apiClient.post('/api/Activity/create-activity-entry', data);
    return response.data;
},

updateActivityEntry: async (data: any): Promise<BaseResponse<any>> => {
  const response = await apiClient.put('/api/Activity/update-activity-entry', data);
  return response.data;
},
getActivityEntryById: async (activityDetailId:any): Promise<BaseResponse<any>>=>{
    const response = await apiClient.get(`/api/Activity/get-activity-entry-by-id/${activityDetailId}`, );
    return response.data;
},
// In your activityService.ts file
getAllActivityEntries: async (params: any): Promise<BaseResponse<any>> => {
  const response = await apiClient.get('/api/Activity/get-all-activity-entries', { 
    params: params 
  });
  return response.data;
}

};

export default activityService;