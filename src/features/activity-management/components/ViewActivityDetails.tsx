import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Clock,
  User,
  Activity,
  Calendar,
  ArrowLeft,
  Mail,
  CheckCircle,
  XCircle,
  Edit,
} from 'lucide-react'

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
  updatedAt?: string | null
  activityName?: string
  userName?: string
  userEmail?: string
}

// ============================================
// Dummy Data
// ============================================

const DUMMY_USERS: User[] = [
  { userId: 1, firstName: 'John', lastName: 'Doe', strEmail: 'john.doe@email.com' },
  { userId: 2, firstName: 'Jane', lastName: 'Smith', strEmail: 'jane.smith@email.com' },
  { userId: 3, firstName: 'Bob', lastName: 'Johnson', strEmail: 'bob.johnson@email.com' },
  { userId: 4, firstName: 'Alice', lastName: 'Williams', strEmail: 'alice.williams@email.com' },
  { userId: 5, firstName: 'Charlie', lastName: 'Brown', strEmail: 'charlie.brown@email.com' },
]

const DUMMY_ACTIVITIES: Activity[] = [
  { activityId: 1, activityName: 'Compliance Request', activityDescription: 'Compliance related requests', isActive: true, isDefault: true },
  { activityId: 2, activityName: 'User Request', activityDescription: 'User management requests', isActive: true, isDefault: true },
  { activityId: 3, activityName: 'Project Request', activityDescription: 'Project related requests', isActive: true, isDefault: true },
  { activityId: 4, activityName: 'Report Request', activityDescription: 'Report generation requests', isActive: true, isDefault: true },
  { activityId: 5, activityName: 'System Request', activityDescription: 'System access requests', isActive: true, isDefault: false },
]

const DUMMY_ACTIVITY_DETAILS: ActivityDetail[] = [
  {
    activityDetailId: 1,
    activityId: 1,
    userId: 1,
    activityDescription: 'Compliance review for Q2 2024 - All documents verified and approved',
    loginTime: '2024-06-15T09:30:00',
    logoutTime: '2024-06-15T11:45:00',
    currentLocation: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.0060,
    isActive: true,
    createdAt: '2024-06-15T09:30:00',
    updatedAt: null,
  },
  {
    activityDetailId: 2,
    activityId: 2,
    userId: 2,
    activityDescription: 'User access request review - New employee onboarding',
    loginTime: '2024-06-15T10:00:00',
    logoutTime: '2024-06-15T12:30:00',
    currentLocation: 'Los Angeles, USA',
    latitude: 34.0522,
    longitude: -118.2437,
    isActive: true,
    createdAt: '2024-06-15T10:00:00',
    updatedAt: null,
  },
  {
    activityDetailId: 3,
    activityId: 3,
    userId: 3,
    activityDescription: 'Project approval workflow - Phase 2 implementation review',
    loginTime: '2024-06-14T14:00:00',
    logoutTime: '2024-06-14T16:20:00',
    currentLocation: 'Chicago, USA',
    latitude: 41.8781,
    longitude: -87.6298,
    isActive: true,
    createdAt: '2024-06-14T14:00:00',
    updatedAt: null,
  },
  {
    activityDetailId: 4,
    activityId: 4,
    userId: 1,
    activityDescription: 'Monthly report generation - Sales and performance metrics',
    loginTime: '2024-06-14T08:00:00',
    logoutTime: '2024-06-14T10:15:00',
    currentLocation: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.0060,
    isActive: true,
    createdAt: '2024-06-14T08:00:00',
    updatedAt: null,
  },
  {
    activityDetailId: 5,
    activityId: 5,
    userId: 4,
    activityDescription: 'System access configuration - Database permissions update',
    loginTime: '2024-06-13T11:00:00',
    logoutTime: '2024-06-13T13:30:00',
    currentLocation: 'San Francisco, USA',
    latitude: 37.7749,
    longitude: -122.4194,
    isActive: true,
    createdAt: '2024-06-13T11:00:00',
    updatedAt: null,
  },
]

// ============================================
// Main Component
// ============================================

const ViewActivityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<ActivityDetail | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [user, setUser] = useState<User | null>(null)
  const [activity, setActivity] = useState<Activity | null>(null)

  useEffect(() => {
    // Simulate API call
    setLoading(true)
    setTimeout(() => {
      const foundDetail = DUMMY_ACTIVITY_DETAILS.find(
        d => d.activityDetailId === parseInt(id || '0')
      )
      
      if (foundDetail) {
        setDetail(foundDetail)
        const foundUser = DUMMY_USERS.find(u => u.userId === foundDetail.userId)
        setUser(foundUser || null)
        const foundActivity = DUMMY_ACTIVITIES.find(a => a.activityId === foundDetail.activityId)
        setActivity(foundActivity || null)
      }
      setLoading(false)
    }, 500)
  }, [id])

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  // Calculate duration
  const getDuration = (loginTime: string, logoutTime?: string): string => {
    if (!logoutTime) return 'In Progress'
    
    try {
      const start = new Date(loginTime)
      const end = new Date(logoutTime)
      const diffMs = end.getTime() - start.getTime()
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      if (diffHrs > 0) {
        return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ${diffMins} minute${diffMins > 1 ? 's' : ''}`
      }
      return `${diffMins} minute${diffMins > 1 ? 's' : ''}`
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className='flex h-64 flex-col items-center justify-center'>
        <p className='text-lg text-gray-500'>Activity detail not found</p>
        <button
          onClick={() => navigate(-1)}
          className='mt-4 text-blue-600 hover:underline'
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className='p-6'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900'
      >
        <ArrowLeft size={20} />
        Back to Activities
      </button>

      {/* Header Card */}
      <div className='mb-6 rounded-lg bg-white p-6 shadow-md'>
        <div className='flex flex-wrap items-start justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <Activity className='h-6 w-6 text-blue-500' />
              <h1 className='text-2xl font-bold text-gray-800'>
                {activity?.activityName || `Activity #${detail.activityId}`}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  detail.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {detail.isActive ? (
                  <span className='flex items-center gap-1'>
                    <CheckCircle size={14} /> Active
                  </span>
                ) : (
                  <span className='flex items-center gap-1'>
                    <XCircle size={14} /> Inactive
                  </span>
                )}
              </span>
            </div>
            <p className='mt-1 text-sm text-gray-500'>
              Detail ID: #{detail.activityDetailId}
            </p>
          </div>
          <button
            className='flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50'
          >
            <Edit size={16} />
            Edit (View Only)
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column - User Info */}
        <div className='lg:col-span-1'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800'>
              <User size={20} />
              User Information
            </h3>
            {user ? (
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-500'>Full Name</p>
                  <p className='font-medium text-gray-800'>
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Email</p>
                  <p className='flex items-center gap-2 font-medium text-gray-800'>
                    <Mail size={14} className='text-gray-400' />
                    {user.strEmail}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>User ID</p>
                  <p className='font-medium text-gray-800'>#{user.userId}</p>
                </div>
              </div>
            ) : (
              <p className='text-gray-500'>User not found</p>
            )}
          </div>
        </div>

        {/* Right Column - Activity Details */}
        <div className='lg:col-span-2'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800'>
              <Activity size={20} />
              Activity Details
            </h3>

            {/* Activity Description */}
            <div className='mb-4 rounded-lg bg-gray-50 p-4'>
              <p className='text-sm text-gray-500'>Description</p>
              <p className='mt-1 text-gray-800'>
                {detail.activityDescription || 'No description provided'}
              </p>
            </div>

            {/* Time Information */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='rounded-lg bg-gray-50 p-4'>
                <p className='text-sm text-gray-500'>Login Time</p>
                <p className='mt-1 flex items-center gap-2 font-medium text-gray-800'>
                  <Clock size={14} className='text-gray-400' />
                  {formatDate(detail.loginTime)}
                </p>
              </div>
              {detail.logoutTime && (
                <div className='rounded-lg bg-gray-50 p-4'>
                  <p className='text-sm text-gray-500'>Logout Time</p>
                  <p className='mt-1 flex items-center gap-2 font-medium text-gray-800'>
                    <Clock size={14} className='text-gray-400' />
                    {formatDate(detail.logoutTime)}
                  </p>
                </div>
              )}
              <div className='rounded-lg bg-gray-50 p-4'>
                <p className='text-sm text-gray-500'>Duration</p>
                <p className='mt-1 flex items-center gap-2 font-medium text-gray-800'>
                  <Calendar size={14} className='text-gray-400' />
                  {getDuration(detail.loginTime, detail.logoutTime)}
                </p>
              </div>
              <div className='rounded-lg bg-gray-50 p-4'>
                <p className='text-sm text-gray-500'>Status</p>
                <p className='mt-1 font-medium text-gray-800'>
                  {detail.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            {/* Location Information */}
            {(detail.currentLocation || detail.latitude || detail.longitude) && (
              <div className='mt-4 rounded-lg bg-gray-50 p-4'>
                <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700'>
                  <MapPin size={16} />
                  Location
                </h4>
                {detail.currentLocation && (
                  <p className='text-gray-800'>{detail.currentLocation}</p>
                )}
                {detail.latitude && detail.longitude && (
                  <p className='mt-1 text-sm text-gray-500'>
                    Coordinates: {detail.latitude}, {detail.longitude}
                  </p>
                )}
              </div>
            )}

            {/* Audit Information */}
            <div className='mt-4 border-t border-gray-200 pt-4'>
              <div className='grid grid-cols-1 gap-2 text-sm text-gray-500 sm:grid-cols-2'>
                <div>
                  <span className='font-medium'>Created At:</span>{' '}
                  {formatDate(detail.createdAt)}
                </div>
                {detail.updatedAt && (
                  <div>
                    <span className='font-medium'>Updated At:</span>{' '}
                    {formatDate(detail.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewActivityDetails