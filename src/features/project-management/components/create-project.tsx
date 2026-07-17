// src/features/project-management/components/create-project.tsx
import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { fileStorageService } from '@/lib/api/fileStorageService'
import { projectService } from '@/lib/api/projectService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

// Form types
type FileItem = {
  fileName: string
  file: File | null
  fileUrl?: string
  filePath?: string
  fileDescription?: string
  isExe: boolean
  size?: string
}

type VersionItem = {
  name: string
  files: FileItem[]
}

type ProjectForm = {
  name: string
  description: string
  createdByUserId: number
  versions: VersionItem[]
}

// Utility function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function CreateProjectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreatePage, setShowCreatePage] = useState(true)

  const form = useForm<ProjectForm>({
    defaultValues: {
      name: '',
      description: '',
      createdByUserId: 2,
      versions: [],
    },
  })

  const {
    fields: versionFields,
    append: appendVersion,
    remove: removeVersion,
  } = useFieldArray({
    control: form.control,
    name: 'versions',
  })

  useEffect(() => {
    return () => {
      const versions = form.getValues('versions') || []
      versions.forEach((version) => {
        ;(version.files || []).forEach((file) => {
          if (file.fileUrl) {
            URL.revokeObjectURL(file.fileUrl)
          }
        })
      })
    }
  }, [form])

  // File selection handler
  const handleFileSelect = (
    versionIndex: number,
    fileIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 100MB)
      // if (file.size > 100 * 1024 * 1024) {
      //   toast.error('File too large', {
      //     description: 'Maximum file size is 100MB',
      //   })
      //   return
      // }

      const fileUrl = URL.createObjectURL(file)
      form.setValue(`versions.${versionIndex}.files.${fileIndex}.file`, file)
      form.setValue(
        `versions.${versionIndex}.files.${fileIndex}.fileUrl`,
        fileUrl
      )
      form.setValue(
        `versions.${versionIndex}.files.${fileIndex}.filePath`,
        fileUrl
      )
      form.setValue(
        `versions.${versionIndex}.files.${fileIndex}.size`,
        formatFileSize(file.size)
      )

      if (
        !form.getValues(`versions.${versionIndex}.files.${fileIndex}.fileName`)
      ) {
        form.setValue(
          `versions.${versionIndex}.files.${fileIndex}.fileName`,
          file.name
        )
      }

      toast.success('File selected', {
        description: `${file.name} (${formatFileSize(file.size)})`,
      })
    }
  }

  // Add version
  const addVersion = () => {
    appendVersion({
      name: `Version ${versionFields.length + 1}`,
      files: [],
    })
    toast.success('Version added')
  }

  // Add file to version
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
        isExe: false,
        size: '',
      },
    ])
  }

  // Remove file from version
  const removeFile = (versionIndex: number, fileIndex: number) => {
    const currentFiles = form.getValues(`versions.${versionIndex}.files`) || []
    const fileToRemove = currentFiles[fileIndex]

    // Clean up object URL if exists
    if (fileToRemove?.fileUrl) {
      URL.revokeObjectURL(fileToRemove.fileUrl)
    }

    currentFiles.splice(fileIndex, 1)
    form.setValue(`versions.${versionIndex}.files`, currentFiles)
  }

  // Go back handler

  const goBack = () => {
    if (form.formState.isDirty) {
      if (
        confirm('You have unsaved changes. Are you sure you want to leave?')
      ) {
        setShowCreatePage(false)
      }
    } else {
      setShowCreatePage(false)
    }
  }

  // Form submission
  const onSubmit = async (data: ProjectForm) => {
    if (!data.name.trim()) {
      toast.error('Project name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const processSubmission = async () => {
        const payloadData = {
          ...data,
          versions: data.versions.map((v) => ({ ...v, files: [...v.files] })),
        }

        for (let i = 0; i < payloadData.versions.length; i++) {
          for (let j = 0; j < payloadData.versions[i].files.length; j++) {
            const fileItem = data.versions[i].files[j]
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
              payloadData.versions[i].files[j].filePath =
                fileItem.filePath || fileItem.fileUrl || ''
            }
          }
        }

        const payload = {
          ProjectName: payloadData.name,
          ProjectDescription: payloadData.description,
          CreatedByUserId: parseInt(
            localStorage.getItem('current_user_id') || '2',
            10
          ),
          ProjectVersions: payloadData.versions.map((version) => ({
            VersionName: version.name,
            Files: version.files.map((file) => ({
              FileName: file.fileName || file.file?.name || '',
              FileDescription: file.fileDescription || '',
              FilePath: file.filePath || '',
            })),
          })),
        }

        const response = await projectService.AddProjects(payload)

        const isSuccess = response?.Issuccess ?? response?.Success ?? false

        if (!isSuccess) {
          throw new Error(
            response?.message || response?.Message || 'Failed to create project'
          )
        }

        toast.success('Project created successfully!')
        form.reset()
        setShowCreatePage(false)
      }

      await processSubmission()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create project'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Save draft
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

  // If showCreatePage is false, return null or a message
  if (!showCreatePage) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <CheckCircle2 className='mx-auto mb-4 h-16 w-16 text-green-500' />
          <h2 className='mb-2 text-2xl font-bold'>Project Created!</h2>
          <p className='mb-4 text-muted-foreground'>
            Redirecting back to projects...
          </p>
          <Button onClick={() => navigate('/tasks')} variant='outline'>
            Go to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header with Simple Breadcrumb */}
      <div className='border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <nav className='flex items-center space-x-1 text-sm text-muted-foreground'>
            <button
              onClick={goBack}
              className='flex items-center gap-1 transition-colors hover:text-foreground'
            >
              <Home className='h-4 w-4' />
              Home
            </button>
            <ChevronRight className='h-4 w-4' />
            <button
              onClick={() => navigate('/tasks')}
              className='transition-colors hover:text-foreground'
            >
              Projects
            </button>
            <ChevronRight className='h-4 w-4' />
            <span className='font-medium text-foreground'>Create Project</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <div className='mb-4 flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate('/tasks')}
              className='gap-2 hover:bg-muted'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to Projects
            </Button>
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>
              {projectName || 'Create New Project'}
            </h1>
            <p className='mt-2 text-muted-foreground'>
              Set up your project with versions and files. You can always add
              more versions later.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Project Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-xl'>
                  <FileIcon className='h-5 w-5' />
                  Project Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <FormField
                  control={form.control}
                  name='name'
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
                        <Input
                          {...field}
                          placeholder='e.g., My Application v2.0'
                          className='max-w-xl'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='Describe your project and its purpose...'
                          rows={6}
                          className='max-w-3xl resize-none'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Versions Section */}
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-xl'>
                    <Package className='h-5 w-5' />
                    Versions
                  </CardTitle>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Add versions to organize your releases. Each version can
                    contain multiple files.
                  </p>
                </div>
                <Button
                  type='button'
                  onClick={addVersion}
                  variant='outline'
                  size='sm'
                  className='gap-2'
                >
                  <Plus className='h-4 w-4' />
                  Add Version
                </Button>
              </CardHeader>
              <CardContent>
                {versionFields.length === 0 ? (
                  <div className='rounded-lg border-2 border-dashed py-16 text-center'>
                    <Package className='mx-auto mb-4 h-16 w-16 text-muted-foreground' />
                    <h3 className='mb-2 text-lg font-semibold'>
                      No Versions Yet
                    </h3>
                    <p className='mx-auto mb-6 max-w-sm text-muted-foreground'>
                      Versions help you track different releases of your
                      project. Start by adding your first version.
                    </p>
                    <Button
                      type='button'
                      onClick={addVersion}
                      variant='outline'
                      size='lg'
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Add First Version
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-6'>
                    {versionFields.map((version, versionIndex) => {
                      const files =
                        form.watch(`versions.${versionIndex}.files`) || []

                      return (
                        <Card key={version.id} className='border-2'>
                          <CardHeader className='bg-muted/50'>
                            <div className='flex items-center justify-between'>
                              <div className='flex flex-1 items-center gap-3'>
                                <Badge
                                  variant='secondary'
                                  className='font-mono text-sm'
                                >
                                  v{versionIndex + 1}
                                </Badge>
                                <FormField
                                  control={form.control}
                                  name={`versions.${versionIndex}.name`}
                                  rules={{
                                    required: 'Version name is required',
                                  }}
                                  render={({ field }) => (
                                    <FormItem className='flex-1'>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder='e.g., v1.0.0, Beta, Release Candidate'
                                          className='h-auto border-0 bg-transparent px-0 py-0 text-lg font-semibold focus-visible:ring-0'
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => {
                                  if (files.length > 0) {
                                    if (
                                      confirm(
                                        'This version contains files. Are you sure you want to remove it?'
                                      )
                                    ) {
                                      removeVersion(versionIndex)
                                    }
                                  } else {
                                    removeVersion(versionIndex)
                                  }
                                }}
                                className='text-destructive hover:text-destructive'
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Remove Version
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className='pt-6'>
                            <div className='space-y-4'>
                              <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                  <h4 className='font-medium'>Files</h4>
                                  <Badge variant='outline'>
                                    {files.length}
                                  </Badge>
                                </div>
                                <Button
                                  type='button'
                                  variant='outline'
                                  size='sm'
                                  onClick={() => addFile(versionIndex)}
                                  className='gap-2'
                                >
                                  <Upload className='h-4 w-4' />
                                  Add File
                                </Button>
                              </div>

                              <Separator />

                              {files.length === 0 ? (
                                <div className='rounded-lg border-2 border-dashed py-8 text-center'>
                                  <FileText className='mx-auto mb-2 h-8 w-8 text-muted-foreground' />
                                  <p className='mb-3 text-sm text-muted-foreground'>
                                    No files added to this version
                                  </p>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => addFile(versionIndex)}
                                  >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Add First File
                                  </Button>
                                </div>
                              ) : (
                                <div className='space-y-3'>
                                  {files.map((file: any, fileIndex: number) => (
                                    <Card
                                      key={fileIndex}
                                      className='border transition-colors hover:border-primary/50'
                                    >
                                      <CardContent className='p-4'>
                                        <div className='grid items-start gap-4 md:grid-cols-[1fr_2fr_250px_auto]'>
                                          <div className='space-y-3'>
                                            <FormField
                                              control={form.control}
                                              name={`versions.${versionIndex}.files.${fileIndex}.fileName`}
                                              rules={{
                                                required:
                                                  'File name is required',
                                              }}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel className='text-xs font-medium'>
                                                    File Name *
                                                  </FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      {...field}
                                                      placeholder='Enter file name'
                                                      className='h-9'
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          </div>

                                          <div className='space-y-3'>
                                            <FormField
                                              control={form.control}
                                              name={`versions.${versionIndex}.files.${fileIndex}.fileDescription`}
                                              rules={{
                                                required:
                                                  'File description is required',
                                              }}
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel className='text-xs font-medium'>
                                                    File Description *
                                                  </FormLabel>
                                                  <FormControl>
                                                    <Input
                                                      {...field}
                                                      placeholder='Enter file description'
                                                      className='h-9'
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                          </div>

                                          <div className='space-y-3'>
                                            <div>
                                              <FormLabel className='text-xs font-medium'>
                                                Upload File
                                              </FormLabel>
                                              <Input
                                                type='file'
                                                onChange={(e) =>
                                                  handleFileSelect(
                                                    versionIndex,
                                                    fileIndex,
                                                    e
                                                  )
                                                }
                                                className='h-9 cursor-pointer'
                                              />
                                              {file.file && (
                                                <div className='mt-2 flex items-center gap-2'>
                                                  <CheckCircle2 className='h-4 w-4 text-green-500' />
                                                  <p className='text-xs text-muted-foreground'>
                                                    {file.file.name} (
                                                    {file.size})
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          <div className='flex items-start gap-2 pt-7'>
                                            <FormField
                                              control={form.control}
                                              name={`versions.${versionIndex}.files.${fileIndex}.isExe`}
                                              render={({ field }) => (
                                                <FormItem className='flex items-center gap-2 space-y-0'>
                                                  <FormControl>
                                                    <Checkbox
                                                      checked={field.value}
                                                      onCheckedChange={
                                                        field.onChange
                                                      }
                                                    />
                                                  </FormControl>
                                                  <FormLabel className='cursor-pointer text-xs'>
                                                    EXE
                                                  </FormLabel>
                                                </FormItem>
                                              )}
                                            />
                                            <Button
                                              type='button'
                                              variant='ghost'
                                              size='icon'
                                              onClick={() =>
                                                removeFile(
                                                  versionIndex,
                                                  fileIndex
                                                )
                                              }
                                              className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                                            >
                                              <X className='h-4 w-4' />
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

            {/* Action Buttons */}
            <div className='sticky bottom-0 flex items-center justify-between border-t bg-background py-4 pt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/tasks')}
              >
                <X className='mr-2 h-4 w-4' />
                Cancel
              </Button>
              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                >
                  <Save className='mr-2 h-4 w-4' />
                  Save as Draft
                </Button>
                <Button type='submit' disabled={isSubmitting} size='lg'>
                  {isSubmitting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='mr-2 h-4 w-4' />
                      Create Project
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

export default CreateProjectPage
