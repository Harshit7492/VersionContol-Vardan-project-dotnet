import apiClient from './apiClient'

export const userService = {
  // Validate / Login User
  login: async (loginData: any) => {
    const response = await apiClient.post('/api/user/Getlogin', loginData)
    return response.data // Structure matches: { Issuccess: boolean, response: userObject }
  },

  // Add User
  add: async (userData: any) => {
    const response = await apiClient.post('/api/user/AddUsers', userData)
    return response.data
  },

  // Fetch Users
  getUsers: async () => {
    const response = await apiClient.get(`/api/user/Getusers`)
    return response.data
  },
  getUsersById: async (userId: number = 0) => {
    const response = await apiClient.get(`/api/user/Getusers?userid=${userId}`)
    return response.data
  },

  // Update User
  update: async (userData: any) => {
    const response = await apiClient.post('/api/user/UpdateUsers', userData)
    return response.data
  },
  deleteUser: async (userId: number) => {
    const response = await apiClient.delete(
      `/api/user/DeleteUsers?userid=${userId}`
    )
    return response.data
  },
  getUserRoles: async ({ statusFilter }: { statusFilter?: number }) => {
    const response = await apiClient.get(
      `/api/user/GetRoles?statusFilter=${statusFilter || 0}`
    )
    return response.data
  },
  addUserRole: async (roleData: any) => {
    const response = await apiClient.post('/api/user/AddRole', roleData)
    return response.data
  },
  updateUserRole: async (roleData: any) => {
    const response = await apiClient.post('/api/user/UpdateRole', roleData)
    return response.data
  },
  getUserProfile: async (userId: number) => {
    console.log('Fetching user profile for userId:', userId)
    const response = await apiClient.get(
      `/api/user/GetUserProfile?userId=${userId}`
    )
    return response.data
  },
  logout: async () => {
    const response = await apiClient.delete('/api/user/Logout')
    return response.data
  },
}
