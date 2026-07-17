import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  FileText,
  Package,
  Save,
  X,
  Home,
  FileIcon,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import { projectService } from '@/lib/api/projectService'
import { fileStorageService } from '@/lib/api/fileStorageService'

type FileItem = {
  fileName: string
  file: File | null
  fileUrl?: string
  filePath?: string
  fileDescription?: string
  size?: string
}

type VersionItem = {
  name: string
  files: FileItem[]
}

type ProjectForm = {
  name: string
  description: string
 UpdatedByUserId: number
  versions: VersionItem[]
}



function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Note: project payload builder removed — we use multipart FormData for updates

// Build FormData for updating project (supports file uploads)
export function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEditPage, setShowEditPage] = useState(true)
  const [isLoadingProject, setIsLoadingProject] = useState(false)

  const form = useForm<ProjectForm>({
    defaultValues: {
      name: '',
      description: '',
      UpdatedByUserId: 2,
      versions: [],
    },
  })

  const { fields: versionFields, append: appendVersion, remove: removeVersion } = useFieldArray({
    control: form.control,
    name: 'versions',
  })

  useEffect(() => {
    return () => {
      const versions = form.getValues('versions') || []
      versions.forEach((version) => {
        (version.files || []).forEach((file) => {
          if (file.fileUrl) {
            URL.revokeObjectURL(file.fileUrl)
          }
        })
      })
    }
  }, [form])

  useEffect(() => {
    if (!projectId) return

    let isMounted = true
    const loadProject = async () => {
      setIsLoadingProject(true)
      try {
        const data = await projectService.GetProjectById(projectId)
        const rawProject = data?.Data ?? data?.response ?? data

        if (!rawProject) {
          throw new Error('Project not found')
        }

        const normalizedForm: ProjectForm = {
          name: rawProject.ProjectName ?? rawProject.name ?? '',
          description: rawProject.ProjectDescription ?? rawProject.description ?? '',
          UpdatedByUserId: parseInt(localStorage.getItem('current_user_id') || '2'),
          versions: (rawProject.Versions || rawProject.versions || []).map((version: any, versionIndex: number) => ({
            name: version.VersionName ?? version.name ?? `Version ${versionIndex + 1}`,
            files: (version.Files || version.files || []).map((file: any) => ({
              fileName: file.FileName ?? file.fileName ?? '',
              file: null,
              fileUrl: file.FilePath ?? file.fileUrl ?? '',
              filePath: file.FilePath ?? file.filePath ?? '',
              fileDescription: file.FileDescription ?? file.fileDescription ?? file.Description ?? file.description ?? '',
              size: '',
            })),
          })),
        }

        if (isMounted) {
          form.reset(normalizedForm)
        }
      } catch (error) {
        console.error('Failed to load project:', error)
        toast.error('Failed to load project')
      } finally {
        if (isMounted) {
          setIsLoadingProject(false)
        }
      }
    }

    loadProject()

    return () => {
      isMounted = false
    }
  }, [projectId, form])

  const handleFileSelect = (versionIndex: number, fileIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // if (file.size > 100 * 1024 * 1024) {
      //   toast.error('File too large', {
      //     description: 'Maximum file size is 100MB',
      //   })
      //   return
      // }

      const fileUrl = URL.createObjectURL(file)
      form.setValue(`versions.${versionIndex}.files.${fileIndex}.file`, file)
      form.setValue(`versions.${versionIndex}.files.${fileIndex}.fileUrl`, fileUrl)
      form.setValue(`versions.${versionIndex}.files.${fileIndex}.filePath`, fileUrl)
      form.setValue(`versions.${versionIndex}.files.${fileIndex}.size`, formatFileSize(file.size))

      if (!form.getValues(`versions.${versionIndex}.files.${fileIndex}.fileName`)) {
        form.setValue(`versions.${versionIndex}.files.${fileIndex}.fileName`, file.name)
      }

      toast.success('File selected', {
        description: `${file.name} (${formatFileSize(file.size)})`,
      })
    }
  }

  const addVersion = () => {
    appendVersion({
      name: `Version ${versionFields.length + 1}`,
      files: [],
    })
    toast.success('Version added')
  }

  const addFile = (versionIndex: number) => {
    const currentFiles = form.getValues(`versions.${versionIndex}.files`) || []
    form.setValue(`versions.${versionIndex}.files`, [
      ...currentFiles,
      {
        fileName: '',
        file: null,
        fileUrl: '',
        filePath: '',
        fileDescription: '',
        size: '',
      },
    ])
  }

  const removeFile = (versionIndex: number, fileIndex: number) => {
    const currentFiles = form.getValues(`versions.${versionIndex}.files`) || []
    const fileToRemove = currentFiles[fileIndex]
    if (fileToRemove?.fileUrl) {
      URL.revokeObjectURL(fileToRemove.fileUrl)
    }
    currentFiles.splice(fileIndex, 1)
    form.setValue(`versions.${versionIndex}.files`, currentFiles)
  }

  const goBack = () => {
    if (form.formState.isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        setShowEditPage(false)
      }
    } else {
      setShowEditPage(false)
    }
  }

  const onSubmit = async (data: ProjectForm) => {
    if (!data.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const processSubmission = async () => {
        const payloadData = { ...data, versions: data.versions.map(v => ({ ...v, files: [...v.files] })) }

        for (let i = 0; i < payloadData.versions.length; i++) {
          for (let j = 0; j < payloadData.versions[i].files.length; j++) {
            const fileItem = data.versions[i].files[j];
            if (fileItem.file) {
              const formData = new FormData()
              formData.append('file', fileItem.file)
              
              await fileStorageService.UploadFile(formData).then((res) => {
                payloadData.versions[i].files[j].filePath = res.Url
                if (!payloadData.versions[i].files[j].fileName) {
                  payloadData.versions[i].files[j].fileName = res.FileName
                }
              })
            } else {
              payloadData.versions[i].files[j].filePath = fileItem.filePath || fileItem.fileUrl || ''
            }
          }
        }

        const payload = {
          ProjectName: payloadData.name,
          ProjectDescription: payloadData.description,
          UpdatedByUserId: parseInt(localStorage.getItem('current_user_id') || '2', 10),
          ProjectVersions: payloadData.versions.map((version) => ({
            VersionName: version.name,
            CreatedByUserId: parseInt(localStorage.getItem('current_user_id') || '2', 10),
            Files: version.files.map((file) => ({
              FileName: file.fileName || file.file?.name || '',
              FileDescription: file.fileDescription || '',
              FilePath: file.filePath || '',
              CreatedByUserId: parseInt(localStorage.getItem('current_user_id') || '2', 10)
            }))
          }))
        }

        const response = await projectService.UpdateProject(projectId!, payload)
        const isSuccess = response?.Issuccess ?? response?.Success ?? false
        if (!isSuccess) {
          throw new Error(response?.message || response?.Message || 'Failed to update project')
        }

        const updatedProject = response.response ?? data
        const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]')
        const index = existingProjects.findIndex(
          (p: any) => p.ProjectId === Number(projectId) || p.id === projectId || p.projectId === projectId,
        )
        if (index !== -1) {
          existingProjects[index] = updatedProject
        } else {
          existingProjects.push(updatedProject)
        }
        localStorage.setItem('projects', JSON.stringify(existingProjects))

        window.dispatchEvent(new CustomEvent('projectUpdated', { detail: updatedProject }))

        const projectName = updatedProject.ProjectName ?? updatedProject.name ?? 'Project'
        const versionCount = updatedProject.ProjectVersions?.length ?? updatedProject.versions?.length ?? 0

        toast.success('Project updated successfully!', {
          description: `${projectName} with ${versionCount} version(s)`,
        })

        setShowEditPage(false)
        form.reset()
      }

      await processSubmission();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again later'
      console.error('Error updating project:', error)
      toast.error('Failed to update project', {
        description: message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    const data = form.getValues()
    if (!data.name.trim()) {
      toast.error('Project name is required for draft')
      return
    }

    try {
      const draftProject = {
        ...data,
        id: `draft-${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
      }

      const drafts = JSON.parse(localStorage.getItem('projectDrafts') || '[]')
      drafts.push(draftProject)
      localStorage.setItem('projectDrafts', JSON.stringify(drafts))

      toast.success('Draft saved', {
        description: 'You can continue editing later',
      })
    } catch (error) {
      toast.error('Failed to save draft')
    }
  }

  const projectName = form.watch('name')
  const navigate = useNavigate()

  if (isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">Loading project details…</p>
        </div>
      </div>
    )
  }

  if (!showEditPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Project Updated!</h2>
          <p className="text-muted-foreground mb-4">Redirecting back to projects...</p>
          <Button onClick={() => navigate('/tasks')} variant="outline">
            Go to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            <button
              onClick={goBack}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <ChevronRight className="h-4 w-4" />
            <button
              onClick={() => navigate('/tasks')}
              className="hover:text-foreground transition-colors"
            >
              Projects
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Edit Project</span>
          </nav>
        </div>
      </div>

      <div className="container  mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-muted"
              onClick={() => navigate('/tasks')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {projectName || 'Edit Project'}
            </h1>
            <p className="text-muted-foreground mt-2">
              Update your project details, versions, and files.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileIcon className="h-5 w-5" />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{
                    required: 'Project name is required',
                    minLength: {
                      value: 2,
                      message: 'Project name must be at least 2 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Project name must be less than 100 characters',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., My Application v2.0" className="max-w-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your project and its purpose..."
                          rows={6}
                          className="max-w-3xl resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Versions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add versions to organize your releases. Each version can contain multiple files.
                  </p>
                </div>
                <Button type="button" onClick={addVersion} variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Version
                </Button>
              </CardHeader>
              <CardContent>
                {versionFields.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Versions Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Versions help you track different releases of your project. Start by adding your first version.
                    </p>
                    <Button type="button" onClick={addVersion} variant="outline" size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Version
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {versionFields.map((version, versionIndex) => {
                      const files = form.watch(`versions.${versionIndex}.files`) || []
                      return (
                        <Card key={version.id} className="border-2">
                          <CardHeader className="bg-muted/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Badge variant="secondary" className="text-sm font-mono">
                                  v{versionIndex + 1}
                                </Badge>
                                <FormField
                                  control={form.control}
                                  name={`versions.${versionIndex}.name`}
                                  rules={{ required: 'Version name is required' }}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder="e.g., v1.0.0, Beta, Release Candidate"
                                          className="border-0 bg-transparent font-semibold text-lg h-auto py-0 focus-visible:ring-0 px-0"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (files.length > 0) {
                                    if (confirm('This version contains files. Are you sure you want to remove it?')) {
                                      removeVersion(versionIndex)
                                    }
                                  } else {
                                    removeVersion(versionIndex)
                                  }
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Version
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">Files</h4>
                                  <Badge variant="outline">{files.length}</Badge>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => addFile(versionIndex)} className="gap-2">
                                  <Upload className="h-4 w-4" />
                                  Add File
                                </Button>
                              </div>
                              <Separator />
                              {files.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                  <p className="text-sm text-muted-foreground mb-3">No files added to this version</p>
                                  <Button type="button" variant="ghost" size="sm" onClick={() => addFile(versionIndex)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First File
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {files.map((file: any, fileIndex: number) => (
                                    <Card key={fileIndex} className="border hover:border-primary/50 transition-colors">
                                      <CardContent className="p-4">
                                        <div className="grid gap-4 md:grid-cols-[1fr_2fr_250px_auto] items-start">
                                          <div className="space-y-3">
                                            <FormField
                                              control={form.control}
                                              name={`versions.${versionIndex}.files.${fileIndex}.fileName`}
                                              rules={{ required: 'File name is required' }}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel className="text-xs font-medium">File Name *</FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      {...field}
                                                      placeholder="Enter file name"
                                                      className="h-9"
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          </div>
                                          <div className="space-y-3">
                                            <FormField
                                              control={form.control}
                                              name={`versions.${versionIndex}.files.${fileIndex}.fileDescription`}
                                              rules={{ required: 'File description is required' }}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel className="text-xs font-medium">File Description *</FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      {...field}
                                                      placeholder="Enter file description"
                                                      className="h-9"
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          </div>
                                          <div className="space-y-3">
                                            <div>
                                              <FormLabel className="text-xs font-medium">Upload File</FormLabel>
                                              <Input
                                                type="file"
                                                onChange={(e) => handleFileSelect(versionIndex, fileIndex, e)}
                                                className="h-9 cursor-pointer"
                                              />
                                              {(file.file || file.filePath || file.fileUrl) && (
                                                <div className="flex items-center gap-2 mt-2">
                                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {file.file ? file.file.name : (file.fileName || 'Uploaded File')} {file.size ? `(${file.size})` : ''}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-start gap-2 pt-7">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => removeFile(versionIndex, fileIndex)}
                                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-6 border-t sticky bottom-0 bg-background py-4">
              <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating Project...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Update Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default EditProjectPage
