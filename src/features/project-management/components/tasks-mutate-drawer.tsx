import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { showSubmittedData } from '@/lib/show-submitted-data';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Plus, Trash } from 'lucide-react';
import { useTasks } from './tasks-provider';

type TaskMutateDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: any; // Replace with proper type if available
};

type ProjectFile = {
  fileName: string;
  isExe?: boolean;
};

type ProjectVersion = {
  name: string;
  files?: ProjectFile[];
};

type Project = {
  name: string;
  description?: string;
  versions?: ProjectVersion[];
};

type ProjectForm = {
  projects: Project[];
};

function ProjectFiles({
  control,
  register,
  projectIndex,
  versionIndex,
}: {
  control: any;
  register: any;
  projectIndex: number;
  versionIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `projects.${projectIndex}.versions.${versionIndex}.files` as const,
  });

  return (
    <div className="space-y-3">
  <div className="flex items-center justify-between">
    <FormLabel>Files</FormLabel>

    <Button
      size="sm"
      variant="outline"
      type="button"
      onClick={() =>
        append({
          fileName: '',
          file: null,
          isExe: false,
        })
      }
    >
      <Plus size={14} className="mr-1" />
      Add File
    </Button>
  </div>

  {fields.length === 0 ? (
    <div className="text-sm text-muted-foreground">
      No files added yet.
    </div>
  ) : (
    <div className="space-y-3">
      {fields.map((file, fi) => (
        <div
          key={file.id}
          className="rounded-lg border p-4 space-y-3"
        >
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] items-end">
            {/* File Name */}
            <div className="space-y-1">
              <FormLabel>File Name</FormLabel>
              <Input
                placeholder="Setup v1.0"
                {...register(
                  `projects.${projectIndex}.versions.${versionIndex}.files.${fi}.fileName` as const
                )}
              />
            </div>

            {/* Upload File */}
            <div className="space-y-1">
              <FormLabel>Upload File</FormLabel>
              <Input
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] ?? null

                  // setValue(
                  //   `projects.${projectIndex}.versions.${versionIndex}.files.${fi}.file`,
                  //   selectedFile
                  // )
                }}
              />
            </div>

            {/* EXE Checkbox */}
            {/* <label className="flex items-center gap-2 rounded-md border px-3 py-2 h-10 cursor-pointer">
              <input
                type="checkbox"
                {...register(
                  `projects.${projectIndex}.versions.${versionIndex}.files.${fi}.isExe` as const
                )}
              />
              EXE
            </label> */}

            {/* Delete */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => remove(fi)}
            >
              <Trash size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
  );
}

function ProjectItem({
  control,
  register,
  index,
  onRemoveProject,
  isEditing,
}: {
  control: any;
  register: any;
  index: number;
  onRemoveProject: () => void;
  isEditing: boolean;
}) {
  const { fields: versions, append, remove } = useFieldArray({
    control,
    name: `projects.${index}.versions` as const,
  });

  return (
    <div className="rounded border p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold">Project #{index + 1}</h4>
          <p className="text-sm text-muted-foreground">
            Add versions, files, and EXE details here.
          </p>
        </div>
        {!isEditing && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRemoveProject}
          >
            <Trash size={14} /> Remove
          </Button>
        )}
      </div>

      <FormField
        control={control}
        name={`projects.${index}.name` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g. IPIS" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`projects.${index}.description` as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Optional project description" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        {versions.length === 0 ? (
          <div className="text-sm text-muted-foreground">No versions yet.</div>
        ) : (
          versions.map((version, vi) => (
            <div
              key={version.id}
              className="rounded border p-3 space-y-3 bg-muted/30"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h5 className="font-medium">Version {vi + 1}</h5>
                  <p className="text-sm text-muted-foreground">
                    Manage files and EXE details for this version.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => remove(vi)}
                >
                  <Trash size={14} /> Remove version
                </Button>
              </div>

              <FormField
                control={control}
                name={`projects.${index}.versions.${vi}.name` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="v1, v2, v1.0.0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ProjectFiles
                control={control}
                register={register}
                projectIndex={index}
                versionIndex={vi}
              />
            </div>
          ))
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ name: `v${versions.length + 1}`, files: [] })
          }
        >
          <Plus size={14} /> Add version
        </Button>
      </div>
    </div>
  );
}

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const { setProjects } = useTasks();

  const form = useForm<ProjectForm>({
    defaultValues: {
      projects: [
        {
          name: '',
          description: '',
          versions: [],
        },
      ],
    },
  });

  const { control, handleSubmit, register, reset, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects',
  });

  // Reset form when drawer opens/closes or currentRow changes
  useEffect(() => {
    if (currentRow) {
      reset({
        projects: [
          {
            name: currentRow.name || '',
            description: currentRow.description || '',
            versions: currentRow.versions || [],
          },
        ],
      });
    } else {
      reset({
        projects: [{ name: '', description: '', versions: [] }],
      });
    }
  }, [currentRow, reset]);

  const onSubmit = (data: ProjectForm) => {
    // Deep clean the data
    const normalized = JSON.parse(JSON.stringify(data)) as ProjectForm;

    normalized.projects = normalized.projects.map((project) => ({
      ...project,
      versions: (project.versions || []).map((version) => ({
        ...version,
        files: (version.files || []).map((file) => ({
          fileName: file?.fileName?.trim() ?? '',
          isExe: file?.isExe === true,
        })),
      })),
    }));

    if (currentRow?.__projectIndex != null) {
      // Edit mode
      setProjects((prev) => {
        const next = [...prev];
        next[currentRow.__projectIndex] = normalized.projects[0];
        try {
          localStorage.setItem('projects', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    } else {
      // Create mode (can add multiple)
      setProjects((prev) => {
        const next = [...prev, ...normalized.projects];
        try {
          localStorage.setItem('projects', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }

    showSubmittedData(normalized);
    onOpenChange(false);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          reset();
        }
      }}
    >
      <SheetContent className="flex flex-col sm:max-w-2xl">
        <SheetHeader className="text-start">
          <SheetTitle>{currentRow ? 'Edit Project' : 'Create Projects'}</SheetTitle>
          <SheetDescription>
            {currentRow
              ? 'Update project data, versions and file details.'
              : 'Add one or more projects. Each project can contain multiple versions and files.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="projects-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 space-y-6 overflow-y-auto px-1 py-4"
          >
            <div className="space-y-6">
              {fields.map((field, idx) => (
                <ProjectItem
                  key={field.id}
                  control={control}
                  register={register}
                  index={idx}
                  onRemoveProject={() => remove(idx)}
                  isEditing={!!currentRow}
                />
              ))}

              {!currentRow && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({ name: '', description: '', versions: [] })
                  }
                  className="w-full"
                >
                  <Plus size={14} className="mr-2" />
                  Add another project
                </Button>
              )}
            </div>
          </form>
        </Form>

        <SheetFooter className="gap-3">
          <SheetClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </SheetClose>
          <Button form="projects-form" type="submit" disabled={formState.isSubmitting}>
            {currentRow ? 'Update Project' : 'Save Projects'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}