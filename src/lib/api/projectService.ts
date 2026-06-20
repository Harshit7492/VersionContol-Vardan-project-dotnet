import apiClient from './apiClient';

export const projectService = {
  AddProjects: async (formData: FormData) => {
    const response = await apiClient.post(
      '/api/v1/projects/add-project',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },
  GetAllProjectsList: async () => {
    const response = await apiClient.get('/api/v1/projects/get-all-projects');
    return response.data; // Structure matches: { Success, Message, Error, Data: { Projects: [...] } }
  },
 UpdateProject: async (
  projectId: string,
  formData: FormData
) => {
  const response = await apiClient.put(
    `/api/v1/projects/update-project/${projectId}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
},
  GetProjectById: async (projectId: string) => {
    const response = await apiClient.get(`/api/v1/projects/get-project?projectId=${projectId}`,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  DeleteProject: async (projectId: number) => {
    const response = await apiClient.delete(`/api/v1/projects/delete-project/${projectId}`);
    return response.data;
  },



};