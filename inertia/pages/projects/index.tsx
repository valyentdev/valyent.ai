import React from 'react'
import Project from '#models/project'
import ProjectsLayout from '@/components/projects/projects_layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import CreateProjectDialog from '@/components/projects/create_project_dialog'
import { Link } from '@inertiajs/react'
import { SparkleIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ListProjectsPage({ projects }: { projects: Project[] }) {
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = React.useState(false)
  return (
    <>
      <CreateProjectDialog open={createProjectDialogOpen} setOpen={setCreateProjectDialogOpen} />
      <ProjectsLayout
        breadcrumbs={[{ label: 'Projects' }]}
        headerContent={
          <Button variant="default" onClick={() => setCreateProjectDialogOpen(true)}>
            New project
          </Button>
        }
        left={
          <main className="grid grid-cols-5 gap-5 m-5">
            {projects.map((project) => (
              <Link className="group" href={`/projects/${project.id}`} key={project.id}>
                <Card className="group-hover:border-zinc-600/40 transition-colors">
                  <CardContent className="space-y-3 flex flex-col !py-5">
                    <div className="flex items-center gap-x-1">
                      <SparkleIcon className="h-4.5 w-4.5 text-blue-700" />
                      <span className="font-semibold text-zinc-600 text-sm hover:underline">
                        {project.name}
                      </span>
                    </div>
                    <span className="text-zinc-600 text-xs">
                      Created{' '}
                      {formatDistanceToNow(new Date(project!.createdAt as unknown as string), {
                        addSuffix: true,
                      })}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </main>
        }
      />
    </>
  )
}
