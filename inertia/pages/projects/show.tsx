import React from 'react'
import Project from '#models/project'
import ProjectsLayout from '@/components/projects/projects_layout'
import WebPreview from '@/components/projects/web_preview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code2, PanelTop } from 'lucide-react'
import clsx from 'clsx'

export default function ShowProjectPage({ project }: { project: Project }) {
  const [tabValue, setTabValue] = React.useState('code')
  return (
    <ProjectsLayout
      breadcrumbs={[{ label: 'Projects', href: '/projects' }, { label: `Project ${project.id}` }]}
      left={<>truc</>}
      right={
        <Tabs value={tabValue} onValueChange={setTabValue} className="h-full">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b pr-3">
            <div className="flex items-center gap-2 px-3">
              <TabsList>
                <TabsTrigger value="code">
                  <Code2 className="h-5 w-5" />
                  <span className="ml-2">Code</span>
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <PanelTop className="h-5 w-5" />
                  <span className="ml-2">Preview</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </header>
          <div
            className={clsx(
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-full max-h-[calc(100vh-70px)]',
              tabValue !== 'code' && 'hidden'
            )}
          >
            <WebPreview url={`https://${project.machineId}-8080.valyent.dev`} />
          </div>
          <div
            className={clsx(
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-full max-h-[calc(100vh-70px)] h-full max-h-[calc(100vh-70px)]',
              tabValue !== 'preview' && 'hidden'
            )}
          >
            <WebPreview url={`https://${project.machineId}-3333.valyent.dev`} />
          </div>
        </Tabs>
      }
    ></ProjectsLayout>
  )
}
