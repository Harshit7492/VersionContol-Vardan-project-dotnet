import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Download,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  Package,
  Pencil,
  Upload,
  Layers,
  X,
} from 'lucide-react'
import apiClient from '@/lib/api/apiClient'
import { projectService } from '@/lib/api/projectService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTasks } from './tasks-provider'

export function ProjectsList() {
  const { projects, setProjects, setCurrentRow } = useTasks()
  const navigate = useNavigate()
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(
    new Set()
  )
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set()
  )
  const [uploadingStates, setUploadingStates] = useState<Map<string, boolean>>(
    new Map()
  )
  const [selectedFiles, setSelectedFiles] = useState<Map<string, File>>(
    new Map()
  )

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.GetAllProjectsList()
        const projectsFromApi = data?.Data?.Projects || []

        const normalizedProjects = projectsFromApi.map((project: any) => ({
          ...project,
          name: project.ProjectName,
          description: project.ProjectDescription || '',
          versions: (project.Versions || []).map((version: any) => ({
            ...version,
            name: version.VersionName,
            files: (version.Files || []).map((file: any) => ({
              ...file,
              fileName: file.FileName,
              fileDescription: file.FileDescription || '',
              filePath: file.FilePath,
              fileUrl: getAbsoluteDownloadUrl(file.FilePath),
            })),
          })),
        }))

        setProjects(normalizedProjects)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      }
    }
    fetchProjects()
  }, [setProjects])

  if (!projects || projects.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <FolderOpen className='mb-4 h-12 w-12 text-muted-foreground' />
        <h3 className='mb-2 text-lg font-semibold'>No Projects Yet</h3>
        <p className='mb-4 text-muted-foreground'>
          Create your first project to get started with version control
        </p>
      </div>
    )
  }

  const toggleProject = (index: number) => {
    const next = new Set(expandedProjects)
    if (next.has(index)) {
      next.delete(index)
    } else {
      next.add(index)
    }
    setExpandedProjects(next)
  }

  const toggleVersion = (projectIndex: number, versionIndex: number) => {
    const key = `${projectIndex}-${versionIndex}`
    const next = new Set(expandedVersions)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    setExpandedVersions(next)
  }

  const handleEdit = (project: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentRow(project)
    const projectId = project.ProjectId ?? project.id ?? project.projectId
    if (!projectId) {
      return
    }
    navigate(`/tasks/edit/${projectId}/`)
  }

  const handleUploadFile = async (
    projectIndex: number,
    versionIndex: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()
    const key = `${projectIndex}-${versionIndex}`
    const file = selectedFiles.get(key)

    if (!file) {
      alert('Please select a file first')
      return
    }

    const project = projects[projectIndex]
    const version = project.versions[versionIndex]

    if (!project?.ProjectId || !version?.VersionId) {
      alert('Project or version not found')
      return
    }

    setUploadingStates(new Map(uploadingStates).set(key, true))

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', project.ProjectId.toString())
    formData.append('versionId', version.VersionId.toString())

    // const response = await projectService.UploadFile(formData)

    // if () {
    // Update the local state with the new file
    // const newFile = {
    //   FileId: response.Data.FileId,
    //   FileName: file.name,
    //   FileDescription: '',
    //   FilePath: response.Data.FilePath,
    //   fileUrl: response.Data.FilePath,
    // }

    // const updatedProjects = [...projects]
    // updatedProjects[projectIndex].versions[versionIndex].files.push(newFile)
    // setProjects(updatedProjects)

    // Clear selected file
    //     selectedFiles.delete(key)
    //     setSelectedFiles(new Map(selectedFiles))

    //     alert('File uploaded successfully!')
    //   } else {
    //     alert(response.Message || 'Failed to upload file')
    //   }
    // } catch (error) {
    //   console.error('Failed to upload file:', error)
    //   alert('Failed to upload file')
    // } finally {
    //   setUploadingStates(new Map(uploadingStates).set(key, false))
    // }
    // }
  }
  const handleDownloadFile = async (file: any, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const directUrl = getAbsoluteDownloadUrl(
        file.fileUrl || file.FilePath || file.filePath
      )
      if (directUrl) {
        const link = document.createElement('a')
        link.href = directUrl
        link.download = file.fileName || file.FileName || 'download'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        return
      }

      // if (file.FileId) {
      // const blob = await projectService.DownloadFile(file.FileId)
      // const url = window.URL.createObjectURL(blob)
      // const link = document.createElement('a')
      // link.href = url
      // link.download = file.fileName || file.FileName || 'download'
      // document.body.appendChild(link)
      // link.click()
      // document.body.removeChild(link)
      // window.URL.revokeObjectURL(url)
      // return
      // }

      alert('File URL not available')
    } catch (error) {
      console.error('Failed to download file:', error)
      alert('Failed to download file')
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (['exe', 'msi'].includes(ext || ''))
      return <Package className='h-4 w-4 text-blue-500' />
    if (['zip', 'rar', '7z'].includes(ext || ''))
      return <FileText className='h-4 w-4 text-orange-500' />
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || ''))
      return <FileText className='h-4 w-4 text-green-500' />
    if (['pdf'].includes(ext || ''))
      return <FileText className='h-4 w-4 text-red-500' />
    return <FileText className='h-4 w-4 text-gray-500' />
  }

  const getAbsoluteDownloadUrl = (value?: string) => {
    if (!value) return ''
    if (/^https?:\/\//i.test(value) || value.startsWith('blob:')) return value

    const base = apiClient.defaults.baseURL || window.location.origin
    return new URL(
      value.replace(/^\//, ''),
      base.endsWith('/') ? base : `${base}/`
    ).toString()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className='space-y-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Your Projects</h2>
      </div>

      {projects.map((project, projectIndex) => (
        <Card
          key={project.ProjectId || projectIndex}
          className='transition-shadow hover:shadow-md'
        >
          <CardHeader
            className='cursor-pointer'
            onClick={() => toggleProject(projectIndex)}
          >
            <div className='flex items-center justify-between'>
              <div className='flex flex-1 items-center gap-3'>
                <Button variant='ghost' size='sm' className='h-auto p-0'>
                  {expandedProjects.has(projectIndex) ? (
                    <ChevronDown className='h-5 w-5' />
                  ) : (
                    <ChevronRight className='h-5 w-5' />
                  )}
                </Button>
                <div>
                  <div className='flex items-center gap-2'>
                    <FolderOpen className='h-5 w-5 text-blue-500' />
                    <CardTitle className='text-lg'>{project.name}</CardTitle>
                    <Badge variant='secondary'>
                      {(project.versions || []).length} version
                      {project.versions?.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className='mt-1 text-sm text-muted-foreground'>
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <div
                className='flex items-center gap-2'
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  size='sm'
                  variant='outline'
                  onClick={(e) => handleEdit(project, e)}
                >
                  <Pencil className='mr-1 h-4 w-4' />
                  Edit
                </Button>
                {/* <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => handleDelete(project.ProjectId, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button> */}
              </div>
            </div>
          </CardHeader>

          {expandedProjects.has(projectIndex) && (
            <CardContent>
              {(project.versions || []).length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 text-center'>
                  <Layers className='mb-3 h-10 w-10 text-muted-foreground' />
                  <p className='mb-3 text-muted-foreground'>
                    No versions created yet
                  </p>
                  <Button
                    variant='outline'
                    size='sm'
                    // onClick={(e) => handleAddVersion(projectIndex, e)}
                  >
                    <Plus className='mr-1 h-4 w-4' />
                    Create First Version
                  </Button>
                </div>
              ) : (
                <div className='space-y-3'>
                  {project.versions.map(
                    (version: any, versionIndex: number) => {
                      const isVersionExpanded = expandedVersions.has(
                        `${projectIndex}-${versionIndex}`
                      )
                      const uploadKey = `${projectIndex}-${versionIndex}`
                      const isUploading = uploadingStates.get(uploadKey)
                      const selectedFile = selectedFiles.get(uploadKey)

                      return (
                        <div
                          key={version.VersionId || versionIndex}
                          className='rounded-lg border'
                        >
                          <div
                            className='flex cursor-pointer items-center justify-between rounded-t-lg bg-muted/50 p-3 transition-colors hover:bg-muted'
                            onClick={() =>
                              toggleVersion(projectIndex, versionIndex)
                            }
                          >
                            <div className='flex items-center gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-auto p-0'
                              >
                                {isVersionExpanded ? (
                                  <ChevronDown className='h-4 w-4' />
                                ) : (
                                  <ChevronRight className='h-4 w-4' />
                                )}
                              </Button>
                              <Package className='h-4 w-4 text-green-500' />
                              <span className='font-medium'>
                                {version.name || `Version ${versionIndex + 1}`}
                              </span>
                              <Badge variant='outline' className='text-xs'>
                                {(version.files || []).length} file
                                {version.files?.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>

                          {isVersionExpanded && (
                            <div className='p-3'>
                              {/* File Upload Section */}
                              <div className=''>
                                <div className='flex items-center gap-3'>
                                  {selectedFile && (
                                    <div className='flex-1'>
                                      <div className='flex items-center justify-between rounded bg-muted p-2'>
                                        <span className='truncate text-sm'>
                                          {selectedFile.name}
                                        </span>
                                        <Button
                                          size='sm'
                                          variant='ghost'
                                          onClick={() => {
                                            const newSelected = new Map(
                                              selectedFiles
                                            )
                                            newSelected.delete(uploadKey)
                                            setSelectedFiles(newSelected)
                                          }}
                                        >
                                          <X className='h-4 w-4' />
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  {selectedFile && (
                                    <Button
                                      onClick={(e) =>
                                        handleUploadFile(
                                          projectIndex,
                                          versionIndex,
                                          e
                                        )
                                      }
                                      disabled={isUploading}
                                    >
                                      {isUploading ? (
                                        <>
                                          <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                                          Uploading...
                                        </>
                                      ) : (
                                        <>
                                          <Upload className='mr-2 h-4 w-4' />
                                          Upload
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Files List */}
                              {(version.files || []).length === 0 ? (
                                <div className='py-4 text-center'>
                                  <FileText className='mx-auto mb-2 h-8 w-8 text-muted-foreground' />
                                  <p className='text-sm text-muted-foreground'>
                                    No files in this version. Use the upload
                                    section above to add files.
                                  </p>
                                </div>
                              ) : (
                                <div className='space-y-2'>
                                  {version.files.map(
                                    (file: any, fileIndex: number) => (
                                      <div
                                        key={file.FileId || fileIndex}
                                        className='group flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted'
                                      >
                                        <div className='flex min-w-0 flex-1 items-center gap-3'>
                                          {getFileIcon(file.fileName)}
                                          <div className='min-w-0'>
                                            <p className='truncate font-medium'>
                                              {file.fileName ||
                                                `File ${fileIndex + 1}`}
                                            </p>
                                            <div className='flex items-center gap-2'>
                                              {file.FileSize > 0 && (
                                                <span className='text-xs text-muted-foreground'>
                                                  {formatFileSize(
                                                    file.FileSize
                                                  )}
                                                </span>
                                              )}
                                              {file.ContentType && (
                                                <Badge
                                                  variant='secondary'
                                                  className='text-xs'
                                                >
                                                  {file.ContentType.split(
                                                    '/'
                                                  ).pop()}
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                                          {/* <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => showSubmittedData(file)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button> */}
                                          <Button
                                            size='sm'
                                            variant='ghost'
                                            onClick={(e) =>
                                              handleDownloadFile(file, e)
                                            }
                                          >
                                            <Download className='h-4 w-4' />
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}

export default ProjectsList
