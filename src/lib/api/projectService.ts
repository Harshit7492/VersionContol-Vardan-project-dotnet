import { UpdateIcon } from '@radix-ui/react-icons';
import apiClient from './apiClient';

export const projectService = {
  // Validate / Login User
  AddProjects: async (AddProjectDetails: any) => {
    const response = await apiClient.post('/api/v1/projects/add-project', AddProjectDetails);
    return response.data; // Structure matches: { Issuccess: boolean, response: userObject }
  },
  GetAllProjectsList: async () => {
    const response = await apiClient.get('/api/v1/projects/get-all-projects');
    return response.data; // Structure matches: { Success, Message, Error, Data: { Projects: [...] } }
  },
  UpdateProject: async (projectId: string, UpdateProjectDetails: any) => {
    const response = await apiClient.post(`/api/v1/projects/update-project/${projectId}`, UpdateProjectDetails);
    return response.data;
  },
  GetProjectById: async (projectId: string) => {
    const response = await apiClient.get(`/api/v1/projects/get-project/${projectId}`);
    return response.data;
  }
};