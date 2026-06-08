import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/apiClient'   // Adjust path if needed

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const currentUserId = localStorage.getItem('current_user_id')
      
      if (!currentUserId) {
        console.error('No current_user_id found in localStorage')
        throw new Error('No user ID found')
      }

      const userId = Number(currentUserId)

      const response = await apiClient.get(`/api/user/GetUserProfile`, {
        params: { userId }
      })

      console.log('API Response:', response.data)

      const data = response.data

      if (!data?.Issuccess || !data?.response) {
        console.error('Invalid API response structure:', data)
        throw new Error('Failed to fetch profile')
      }

      console.log('✅ User Profile Loaded:', data.response)
      return data.response
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}