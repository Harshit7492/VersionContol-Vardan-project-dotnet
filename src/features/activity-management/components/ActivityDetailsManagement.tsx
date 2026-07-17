import React, { useState, useEffect, useCallback } from 'react'
import axios, { AxiosInstance } from 'axios'
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Clock,
  User,
  Activity,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// ============================================
// Types and Interfaces
// ============================================

interface User {
  userId: number
  firstName: string
  lastName: string
  strEmail: string
}

interface Activity {
  activityId: number
  activityName: string
  activityDescription?: string
  isActive: boolean
  isDefault: boolean
}

interface ActivityDetail {
  activityDetailId: number
  activityId: number
  userId: number
  activityDescription?: string
  loginTime: string
  logoutTime?: string
  currentLocation?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
  activityName?: string
  userName?: string
  userEmail?: string
}

interface Filters {
  userId: string
  activityId: string
  startDate: string
  endDate: string
  includeInactive: boolean
}

interface FormData {
  activityId: string
  userId: string
  activityDescription: string
  loginTime: string
  logoutTime: string
  currentLocation: string
  latitude: string
  longitude: string
  isActive: boolean
}

interface BaseResponse<T = any> {
  success: boolean
  message: string
  error?: string
  data?: T
}

interface GetAllActivityDetailsResponse {
  activityDetails: ActivityDetail[]
  totalCount: number
}

interface GetAllActivitiesResponse {
  activities: Activity[]
}

interface GetAllUsersResponse {
  users: User[]
}

// ============================================
// API Service
// ============================================

const API_BASE_URL = 'https://localhost:5000/api/v1'

const getToken = (): string | null => {
  // Try localStorage first
  const token = localStorage.getItem('jwt')
  if (token) return token

  // Try cookies
  const cookieMatch = document.cookie.match(/(?:^|;\s*)jwt\s*=\s*([^;]*)/)
  return cookieMatch ? cookieMatch[1] : null
}

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  })

  instance.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  return instance
}

const axiosInstance = createAxiosInstance()

// ============================================
// Main Component
// ============================================

const ActivityDetailsManagement: React.FC = () => {
  const [activityDetails, setActivityDetails] = useState<ActivityDetail[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingDetail, setEditingDetail] = useState<ActivityDetail | null>(
    null
  )
  const [filters, setFilters] = useState<Filters>({
    userId: '',
    activityId: '',
    startDate: '',
    endDate: '',
    includeInactive: false,
  })
  const [formData, setFormData] = useState<FormData>({
    activityId: '',
    userId: '',
    activityDescription: '',
    loginTime: '',
    logoutTime: '',
    currentLocation: '',
    latitude: '',
    longitude: '',
    isActive: true,
  })

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch activity details
      const detailsResponse = await axiosInstance.get<
        BaseResponse<GetAllActivityDetailsResponse>
      >('/activities/get-all-activity-details', {
        params: {
          includeInactive: filters.includeInactive,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
      })

      if (detailsResponse.data.success && detailsResponse.data.data) {
        setActivityDetails(detailsResponse.data.data.activityDetails || [])
      }

      // Fetch activities for dropdown
      const activitiesResponse = await axiosInstance.get<
        BaseResponse<GetAllActivitiesResponse>
      >('/activities/get-all-activities')
      if (activitiesResponse.data.success && activitiesResponse.data.data) {
        setActivities(activitiesResponse.data.data.activities || [])
      }

      // Fetch users for dropdown
      const usersResponse = await axiosInstance.get<
        BaseResponse<GetAllUsersResponse>
      >('/users/get-all-users')
      if (usersResponse.data.success && usersResponse.data.data) {
        setUsers(usersResponse.data.data.users || [])
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Error fetching data')
      } else {
        toast.error('An unexpected error occurred')
      }
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        activityId: parseInt(formData.activityId, 10),
        userId: parseInt(formData.userId, 10),
        activityDescription: formData.activityDescription,
        loginTime: formData.loginTime || new Date().toISOString(),
        logoutTime: formData.logoutTime || null,
        currentLocation: formData.currentLocation,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        isActive: formData.isActive,
      }

      if (editingDetail) {
        const response = await axiosInstance.put<BaseResponse>(
          `/activities/update-activity-details/${editingDetail.activityDetailId}`,
          payload
        )
        if (response.data.success) {
          toast.success('Activity detail updated successfully')
          await fetchAllData()
          closeModal()
        } else {
          toast.error(response.data.message || 'Failed to update')
        }
      } else {
        const response = await axiosInstance.post<BaseResponse>(
          '/activities/add-activity-details',
          payload
        )
        if (response.data.success) {
          toast.success('Activity detail added successfully')
          await fetchAllData()
          closeModal()
        } else {
          toast.error(response.data.message || 'Failed to add')
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'An error occurred')
      } else {
        toast.error('An unexpected error occurred')
      }
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  // Delete activity detail
  const handleDelete = async (detailId: number) => {
    if (
      !window.confirm('Are you sure you want to delete this activity detail?')
    )
      return

    setLoading(true)
    try {
      const response = await axiosInstance.delete<BaseResponse>(
        `/activities/delete-activity-details/${detailId}`
      )
      if (response.data.success) {
        toast.success('Activity detail deleted successfully')
        await fetchAllData()
      } else {
        toast.error(response.data.message || 'Failed to delete')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || 'Error deleting activity detail'
        )
      } else {
        toast.error('An unexpected error occurred')
      }
      console.error('Error deleting activity detail:', error)
    } finally {
      setLoading(false)
    }
  }

  // Open modal
  const openModal = (detail: ActivityDetail | null = null) => {
    if (detail) {
      setEditingDetail(detail)
      setFormData({
        activityId: detail.activityId.toString(),
        userId: detail.userId.toString(),
        activityDescription: detail.activityDescription || '',
        loginTime: detail.loginTime
          ? new Date(detail.loginTime).toISOString().slice(0, 16)
          : '',
        logoutTime: detail.logoutTime
          ? new Date(detail.logoutTime).toISOString().slice(0, 16)
          : '',
        currentLocation: detail.currentLocation || '',
        latitude: detail.latitude?.toString() || '',
        longitude: detail.longitude?.toString() || '',
        isActive: detail.isActive,
      })
    } else {
      setEditingDetail(null)
      setFormData({
        activityId: '',
        userId: '',
        activityDescription: '',
        loginTime: new Date().toISOString().slice(0, 16),
        logoutTime: '',
        currentLocation: '',
        latitude: '',
        longitude: '',
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDetail(null)
    setFormData({
      activityId: '',
      userId: '',
      activityDescription: '',
      loginTime: '',
      logoutTime: '',
      currentLocation: '',
      latitude: '',
      longitude: '',
      isActive: true,
    })
  }

  // Helper functions
  const getUserName = (userId: number): string => {
    const user = users.find((u) => u.userId === userId)
    return user ? `${user.firstName} ${user.lastName}` : `User ${userId}`
  }

  const getActivityName = (activityId: number): string => {
    const activity = activities.find((a) => a.activityId === activityId)
    return activity ? activity.activityName : `Activity ${activityId}`
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      userId: '',
      activityId: '',
      startDate: '',
      endDate: '',
      includeInactive: false,
    })
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }
  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Activity Details</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Track and manage all user activities
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
        >
          <Plus size={18} />
          Add Activity Detail
        </button>
      </div>

      {/* Filters */}
      <div className='mb-6 rounded-lg bg-white p-4 shadow-md'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              User
            </label>
            <select
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            >
              <option value=''>All Users</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Activity
            </label>
            <select
              value={filters.activityId}
              onChange={(e) =>
                setFilters({ ...filters, activityId: e.target.value })
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            >
              <option value=''>All Activities</option>
              {activities.map((activity) => (
                <option key={activity.activityId} value={activity.activityId}>
                  {activity.activityName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              Start Date
            </label>
            <input
              type='date'
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium text-gray-700'>
              End Date
            </label>
            <input
              type='date'
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
            />
          </div>
        </div>
        <div className='mt-4 flex items-center gap-4'>
          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <input
              type='checkbox'
              checked={filters.includeInactive}
              onChange={(e) =>
                setFilters({ ...filters, includeInactive: e.target.checked })
              }
              className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
            />
            Include Inactive
          </label>
          <button
            onClick={clearFilters}
            className='rounded-lg px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100'
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Activity Details Cards */}
      {loading ? (
        <div className='flex items-center justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      ) : activityDetails.length === 0 ? (
        <div className='rounded-lg bg-white p-8 text-center shadow-md'>
          <p className='text-gray-500'>No activity details found</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {activityDetails.map((detail) => (
            <div
              key={detail.activityDetailId}
              className='rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg'
              onClick={() => navigate(`/activity-detail/${activityDetailId}`)}
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Activity size={16} className='text-blue-500' />
                    <h3 className='font-semibold text-gray-800'>
                      {getActivityName(detail.activityId)}
                    </h3>
                  </div>
                  <div className='mb-1 flex items-center gap-2 text-sm text-gray-600'>
                    <User size={14} />
                    <span>{getUserName(detail.userId)}</span>
                  </div>
                  {detail.currentLocation && (
                    <div className='mb-1 flex items-center gap-2 text-sm text-gray-600'>
                      <MapPin size={14} />
                      <span>{detail.currentLocation}</span>
                    </div>
                  )}
                  {detail.latitude && detail.longitude && (
                    <div className='text-xs text-gray-500'>
                      📍 {detail.latitude}, {detail.longitude}
                    </div>
                  )}
                  <div className='mt-2 flex items-center gap-2 text-sm text-gray-600'>
                    <Clock size={14} />
                    <span>
                      {formatDate(detail.loginTime)}
                      {detail.logoutTime &&
                        ` → ${formatDate(detail.logoutTime)}`}
                    </span>
                  </div>
                  {detail.activityDescription && (
                    <p className='mt-2 border-t pt-2 text-sm text-gray-600'>
                      {detail.activityDescription}
                    </p>
                  )}
                  <div className='mt-2 flex items-center gap-2'>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        detail.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {detail.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className='ml-2 flex flex-col gap-2'>
                  <button
                    onClick={() => openModal(detail)}
                    className='rounded-lg p-1 text-blue-600 transition-colors hover:bg-blue-50'
                    title='Edit'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(detail.activityDetailId)}
                    className='rounded-lg p-1 text-red-600 transition-colors hover:bg-red-50'
                    title='Delete'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-gray-800'>
                {editingDetail ? 'Edit Activity Detail' : 'Add Activity Detail'}
              </h2>
              <button
                onClick={closeModal}
                className='rounded-lg p-1 transition-colors hover:bg-gray-100'
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Activity <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={formData.activityId}
                    onChange={(e) =>
                      setFormData({ ...formData, activityId: e.target.value })
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    required
                  >
                    <option value=''>Select Activity</option>
                    {activities.map((activity) => (
                      <option
                        key={activity.activityId}
                        value={activity.activityId}
                      >
                        {activity.activityName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    User <span className='text-red-500'>*</span>
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) =>
                      setFormData({ ...formData, userId: e.target.value })
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    required
                  >
                    <option value=''>Select User</option>
                    {users.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Description
                </label>
                <textarea
                  value={formData.activityDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      activityDescription: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  rows={3}
                  placeholder='Enter activity description'
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Login Time
                  </label>
                  <input
                    type='datetime-local'
                    value={formData.loginTime}
                    onChange={(e) =>
                      setFormData({ ...formData, loginTime: e.target.value })
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Logout Time
                  </label>
                  <input
                    type='datetime-local'
                    value={formData.logoutTime}
                    onChange={(e) =>
                      setFormData({ ...formData, logoutTime: e.target.value })
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  Current Location
                </label>
                <input
                  type='text'
                  value={formData.currentLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentLocation: e.target.value,
                    })
                  }
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  placeholder='e.g., New York, USA'
                />
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Latitude
                  </label>
                  <input
                    type='number'
                    step='0.00000001'
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    placeholder='40.7128'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    Longitude
                  </label>
                  <input
                    type='number'
                    step='0.00000001'
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                    placeholder='-74.0060'
                  />
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='isActiveDetail'
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <label
                  htmlFor='isActiveDetail'
                  className='text-sm text-gray-700'
                >
                  Active
                </label>
              </div>

              <div className='mt-6 flex items-center justify-end gap-3 border-t pt-4'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='rounded-lg px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50'
                >
                  {loading ? 'Saving...' : editingDetail ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityDetailsManagement
