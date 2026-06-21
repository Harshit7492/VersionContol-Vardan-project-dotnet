import apiClient from './apiClient'

export const fileStorageService = {
  UploadFile: async (formData: FormData) => {
    const response = await apiClient.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  },
}
