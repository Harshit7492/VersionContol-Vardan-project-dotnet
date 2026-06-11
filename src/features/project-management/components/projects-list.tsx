import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  Download,
  FolderDown,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  Package,
  Pencil,
  Eye,
  Upload,
  Layers,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useTasks } from './tasks-provider'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { projectService } from '@/lib/api/projectService'

export function ProjectsList() {
  const { projects, setProjects, setCurrentRow } = useTasks()
  const navigate = useNavigate()
  // const [projects, setProjects] = useState<any[]>([])
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set())
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first project to get started with version control
        </p>
        {/* <Button onClick={() => setOpen('add')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Project
        </Button> */}
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

  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setProjects((prev) => {
        const next = prev.filter((_, idx) => idx !== index)
        try {
          localStorage.setItem('projects', JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
    }
  }

  const handleEdit = (project: any, index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentRow({
      ...project,
      __projectIndex: index,
    })

    const projectId = project.ProjectId ?? project.id ?? project.projectId
    if (!projectId) {
      return
    }

    navigate({ to: `/tasks/edit/${projectId}/` })
  }

  const handleAddVersion = (projectIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentRow({
      __projectIndex: projectIndex,
    })
    // setOpen('addVersion')
  }

  const handleAddFile = (projectIndex: number, versionIndex: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentRow({
      __projectIndex: projectIndex,
      __versionIndex: versionIndex,
    })
    // setOpen('addFile')
  }

  const handleDownloadFile = (file: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const href = file?.fileUrl || file?.filePath
    if (!href) return

    const link = document.createElement('a')
    link.href = href
    link.download = file.fileName || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadVersion = (version: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!version?.zipUrl) return

    const link = document.createElement('a')
    link.href = version.zipUrl
    link.download = `${version.name || 'version'}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase()
    if (['exe', 'msi'].includes(ext || '')) return <Package className="h-4 w-4 text-blue-500" />
    if (['zip', 'rar', '7z'].includes(ext || '')) return <FileText className="h-4 w-4 text-orange-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Projects</h2>
       
      </div>

      {projects.map((project, projectIndex) => (
        <Card key={projectIndex} className="hover:shadow-md transition-shadow">
          <CardHeader className="cursor-pointer" onClick={() => toggleProject(projectIndex)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Button variant="ghost" size="sm" className="p-0 h-auto">
                  {expandedProjects.has(projectIndex) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant="secondary">
                      {(project.versions || []).length} version{project.versions?.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleEdit(project, projectIndex, e)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleAddVersion(projectIndex, e)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Version
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => handleDelete(projectIndex, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedProjects.has(projectIndex) && (
            <CardContent>
              {(project.versions || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Layers className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-3">No versions created yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleAddVersion(projectIndex, e)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create First Version
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {project.versions.map((version: any, versionIndex: number) => {
                    const isVersionExpanded = expandedVersions.has(`${projectIndex}-${versionIndex}`)
                    return (
                      <div key={versionIndex} className="border rounded-lg">
                        <div
                          className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted transition-colors rounded-t-lg"
                          onClick={() => toggleVersion(projectIndex, versionIndex)}
                        >
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="p-0 h-auto">
                              {isVersionExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <Package className="h-4 w-4 text-green-500" />
                            <span className="font-medium">
                              {version.name || `Version ${versionIndex + 1}`}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {(version.files || []).length} file{version.files?.length !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => handleAddFile(projectIndex, versionIndex, e)}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Add File
                            </Button>
                            {version.zipUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleDownloadVersion(version, e)}
                              >
                                <FolderDown className="h-4 w-4 mr-1" />
                                Download All
                              </Button>
                            )}
                          </div>
                        </div>

                        {isVersionExpanded && (
                          <div className="p-3">
                            {(version.files || []).length === 0 ? (
                              <div className="text-center py-4">
                                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                  No files in this version
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => handleAddFile(projectIndex, versionIndex, e)}
                                >
                                  <Upload className="h-4 w-4 mr-1" />
                                  Upload File
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {version.files.map((file: any, fileIndex: number) => (
                                  <div
                                    key={fileIndex}
                                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors group"
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      {getFileIcon(file.fileName)}
                                      <div className="min-w-0">
                                        <p className="font-medium truncate">
                                          {file.fileName || `File ${fileIndex + 1}`}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          {file.isExe && (
                                            <Badge variant="secondary" className="text-xs">
                                              EXE
                                            </Badge>
                                          )}
                                          {file.size && (
                                            <span className="text-xs text-muted-foreground">
                                              {file.size}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => showSubmittedData(file)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => handleDownloadFile(file, e)}
                                        disabled={!file.fileUrl}
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
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