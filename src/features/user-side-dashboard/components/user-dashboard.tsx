import { useEffect, useMemo, useState } from 'react'
import {
  FolderOpen,
  Package,
  // FileText,
  Download,
  // Search,
  ChevronRight,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { projectService } from '@/lib/api/projectService'
import { Badge } from '@/components/ui/badge'
// import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UserDashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [search] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(
    new Set()
  )
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set()
  )
  const [downloadingFiles, setDownloadingFiles] = useState<Set<number>>(
    new Set()
  )

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const data = await projectService.GetAllProjectsList()
      const projectsFromApi = data?.Data?.Projects || []

      // Normalize the API response to match the expected structure
      const normalizedProjects = projectsFromApi.map((project: any) => ({
        ProjectId: project.ProjectId,
        ProjectName: project.ProjectName,
        ProjectDescription: project.ProjectDescription || '',
        CreatedAt: project.CreatedAt,
        UpdatedAt: project.UpdatedAt,
        Versions: (project.Versions || []).map((version: any) => ({
          VersionId: version.VersionId,
          VersionName: version.VersionName,
          Files: (version.Files || []).map((file: any) => ({
            FileId: file.FileId,
            FileName: file.FileName,
            FileDescription: file.FileDescription || '',
            FilePath: file.FilePath,
            ContentType: file.ContentType || '',
            FileSize: file.FileSize || 0,
          })),
        })),
      }))

      setProjects(normalizedProjects)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      p.ProjectName?.toLowerCase().includes(search.toLowerCase())
    )
  }, [projects, search])

  const toggleProject = (projectId: number) => {
    const next = new Set(expandedProjects)
    if (next.has(projectId)) {
      next.delete(projectId)
    } else {
      next.add(projectId)
    }
    setExpandedProjects(next)
  }

  const toggleVersion = (projectId: number, versionId: number) => {
    const key = `${projectId}-${versionId}`
    const next = new Set(expandedVersions)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setExpandedVersions(next)
  }

  const downloadFile = async (file: any) => {
    if (downloadingFiles.has(file.FileId)) return

    try {
      setDownloadingFiles((prev) => new Set(prev).add(file.FileId))

      let blob: Blob

      if (file.FilePath) {
        // Primary: use FilePath key to download via server-side path
        // blob = await projectService.DownloadFileByPath(file.FilePath)
      } else {
        // Fallback: download by FileId
        // blob = await projectService.DownloadFile(file.FileId)
      }

      const url = window.URL.createObjectURL(file.FilePath)
      const link = document.createElement('a')
      link.href = url
      link.download = file.FileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Downloaded: ${file.FileName}`)
    } catch (error) {
      console.error('Failed to download file:', error)
      toast.error(`Failed to download: ${file.FileName}`)
    } finally {
      setDownloadingFiles((prev) => {
        const next = new Set(prev)
        next.delete(file.FileId)
        return next
      })
    }
  }

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '-'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (['exe', 'msi'].includes(ext || '')) return '💻'
    if (['zip', 'rar', '7z'].includes(ext || '')) return '📦'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return '🖼️'
    if (['pdf'].includes(ext || '')) return '📄'
    if (['doc', 'docx'].includes(ext || '')) return '📝'
    if (['mp4', 'avi', 'mov'].includes(ext || '')) return '🎬'
    if (['mp3', 'wav'].includes(ext || '')) return '🎵'
    return '📁'
  }

  const getContentTypeBadge = (contentType: string) => {
    if (!contentType) return null
    const type = contentType.split('/').pop()?.toUpperCase() || ''
    return (
      <Badge variant='outline' className='text-xs'>
        {type}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex min-h-[400px] flex-col items-center justify-center'>
          <Loader2 className='mb-4 h-8 w-8 animate-spin text-primary' />
          <p className='text-muted-foreground'>Loading projects...</p>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex min-h-[400px] flex-col items-center justify-center text-center'>
          <FolderOpen className='mb-4 h-12 w-12 text-muted-foreground' />
          <h3 className='mb-2 text-lg font-semibold'>No Projects Available</h3>
          <p className='text-muted-foreground'>
            There are no projects to display at the moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-6 p-4 md:p-6'>
      {/* Header */}
      <div className='space-y-3'>
        <h1 className='text-2xl font-bold md:text-3xl'>Downloads Center</h1>
        <p className='text-muted-foreground'>
          Browse projects, versions and download files.
        </p>
      </div>

      {/* Search */}
      {/* <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div> */}

      {/* Projects */}
      <div className='space-y-4'>
        {filteredProjects.length === 0 ? (
          <div className='py-8 text-center'>
            <p className='text-muted-foreground'>
              No projects found matching your search.
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isExpanded = expandedProjects.has(project.ProjectId)
            const totalFiles =
              project.Versions?.reduce(
                (sum: number, version: any) =>
                  sum + (version.Files?.length || 0),
                0
              ) || 0

            return (
              <Card
                key={project.ProjectId}
                className='shadow-sm transition-shadow hover:shadow-md'
              >
                <CardHeader
                  className='cursor-pointer transition-colors hover:bg-muted/50'
                  onClick={() => toggleProject(project.ProjectId)}
                >
                  <div className='flex flex-col justify-between gap-3 md:flex-row md:items-center'>
                    <div className='flex items-start gap-3'>
                      <FolderOpen className='mt-1 h-5 w-5 flex-shrink-0 text-blue-600' />
                      <div className='min-w-0'>
                        <CardTitle className='truncate text-lg md:text-xl'>
                          {project.ProjectName}
                        </CardTitle>
                        {project.ProjectDescription && (
                          <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                            {project.ProjectDescription}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='ml-auto flex flex-shrink-0 items-center gap-2 md:ml-0'>
                      <Badge variant='secondary' className='whitespace-nowrap'>
                        {project.Versions?.length || 0} Versions
                      </Badge>
                      <Badge variant='outline' className='whitespace-nowrap'>
                        {totalFiles} Files
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent>
                    <div className='space-y-3'>
                      {project.Versions?.map((version: any) => {
                        const versionKey = `${project.ProjectId}-${version.VersionId}`
                        const isVersionExpanded =
                          expandedVersions.has(versionKey)

                        return (
                          <div
                            key={version.VersionId}
                            className='overflow-hidden rounded-lg border'
                          >
                            <div
                              className='flex cursor-pointer flex-col justify-between gap-2 bg-muted/40 p-3 transition-colors hover:bg-muted/60 sm:flex-row sm:items-center md:p-4'
                              onClick={() =>
                                toggleVersion(
                                  project.ProjectId,
                                  version.VersionId
                                )
                              }
                            >
                              <div className='flex items-center gap-2'>
                                <Package className='h-4 w-4 flex-shrink-0 text-green-600' />
                                <span className='font-medium'>
                                  {version.VersionName}
                                </span>
                                <Badge variant='secondary' className='text-xs'>
                                  {version.Files?.length || 0} Files
                                </Badge>
                              </div>
                              <div className='ml-auto flex items-center gap-2 sm:ml-0'>
                                {/* {version.Files?.length > 0 && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      downloadAllVersionFiles(project.ProjectId, version)
                                    }}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download All
                                  </Button>
                                )} */}
                                {isVersionExpanded ? (
                                  <ChevronDown className='h-4 w-4' />
                                ) : (
                                  <ChevronRight className='h-4 w-4' />
                                )}
                              </div>
                            </div>

                            {isVersionExpanded && (
                              <div className='overflow-x-auto'>
                                {version.Files?.length === 0 ? (
                                  <div className='p-4 text-center text-muted-foreground'>
                                    No files in this version
                                  </div>
                                ) : (
                                  <table className='w-full'>
                                    <thead>
                                      <tr className='border-b bg-muted/30'>
                                        <th className='p-3 text-left text-sm font-medium'>
                                          File Name
                                        </th>
                                        <th className='hidden p-3 text-left text-sm font-medium md:table-cell'>
                                          Type
                                        </th>
                                        <th className='hidden p-3 text-left text-sm font-medium sm:table-cell'>
                                          Size
                                        </th>
                                        <th className='p-3 text-right text-sm font-medium'>
                                          Action
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {version.Files?.map((file: any) => {
                                        const isDownloading =
                                          downloadingFiles.has(file.FileId)
                                        return (
                                          <tr
                                            key={file.FileId}
                                            className='border-b transition-colors hover:bg-muted/30'
                                          >
                                            <td className='p-3'>
                                              <div className='flex items-center gap-2'>
                                                <span className='text-lg'>
                                                  {getFileIcon(file.FileName)}
                                                </span>
                                                <span className='max-w-[150px] truncate text-sm md:max-w-xs'>
                                                  {file.FileName}
                                                </span>
                                              </div>
                                            </td>
                                            <td className='hidden p-3 md:table-cell'>
                                              {getContentTypeBadge(
                                                file.ContentType
                                              )}
                                            </td>
                                            <td className='hidden p-3 text-sm sm:table-cell'>
                                              {formatSize(file.FileSize)}
                                            </td>
                                            <td className='p-3 text-right'>
                                              <Button
                                                size='sm'
                                                onClick={() =>
                                                  downloadFile(file)
                                                }
                                                disabled={isDownloading}
                                                className='min-w-[80px]'
                                              >
                                                {isDownloading ? (
                                                  <>
                                                    <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                                                    <span className='text-xs'>
                                                      Downloading...
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Download className='mr-1 h-3 w-3' />
                                                    <span>Download</span>
                                                  </>
                                                )}
                                              </Button>
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
