// features/user-side-dashboard/index.tsx
import { useEffect } from 'react'
import {
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Activity,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock data - Replace with actual API calls
const mockStats = {
  totalChats: 156,
  activeChats: 23,
  resolvedChats: 118,
  pendingChats: 15,
  averageResponseTime: '2.4m',
  satisfactionRate: '94%',
}

const mockRecentChats = [
  {
    id: 1,
    user: {
      name: 'Alice Johnson',
      avatar: '/avatars/01.png',
      initials: 'AJ',
    },
    message: 'Need help with project setup',
    timestamp: '5 min ago',
    status: 'active',
    priority: 'high',
  },
  {
    id: 2,
    user: {
      name: 'Bob Smith',
      avatar: '/avatars/02.png',
      initials: 'BS',
    },
    message: 'Question about billing',
    timestamp: '15 min ago',
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 3,
    user: {
      name: 'Carol White',
      avatar: '/avatars/03.png',
      initials: 'CW',
    },
    message: 'Feature request for new integration',
    timestamp: '1 hour ago',
    status: 'resolved',
    priority: 'low',
  },
  {
    id: 4,
    user: {
      name: 'David Brown',
      avatar: '/avatars/04.png',
      initials: 'DB',
    },
    message: 'Unable to access my account',
    timestamp: '2 hours ago',
    status: 'active',
    priority: 'urgent',
  },
  {
    id: 5,
    user: {
      name: 'Eva Martinez',
      avatar: '/avatars/05.png',
      initials: 'EM',
    },
    message: 'Feedback about new feature',
    timestamp: '3 hours ago',
    status: 'pending',
    priority: 'low',
  },
]

const mockChatSummary = [
  { label: 'Total Messages', value: '1,284', change: '+12%' },
  { label: 'Users Assisted', value: '342', change: '+8%' },
  { label: 'Avg. Session', value: '12m', change: '-3%' },
  { label: 'Response Rate', value: '98%', change: '+2%' },
]

export default function UserDashboard() {
  const stats = mockStats
  const recentChats = mockRecentChats
  const chatSummary = mockChatSummary

  // Fetch data on mount
  useEffect(() => {
    // Replace with actual API calls
    // fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'resolved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your chats.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChats}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChats}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeChats} chats in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedChats}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.resolvedChats / stats.totalChats) * 100)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingChats}</div>
            <p className="text-xs text-muted-foreground">
              Avg response time: {stats.averageResponseTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {chatSummary.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Chats Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Chats</CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentChats.map((chat) => (
                <TableRow key={chat.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
                        <AvatarFallback>{chat.user.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{chat.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="line-clamp-1">{chat.message}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(chat.status)}>
                      {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(chat.priority)}
                      <span className="capitalize">{chat.priority}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {chat.timestamp}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.satisfactionRate}</span>
              <div className="h-2 w-24 rounded-full bg-muted">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ width: '94%' }}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Based on 342 responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Average time to first response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Avatar key={i} className="h-10 w-10 border-2 border-background">
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                +12
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              23 users are currently active
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}