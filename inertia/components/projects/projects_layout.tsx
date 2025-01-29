import { AppSidebar } from '@/components/projects/app_sidebar'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Fragment } from 'react/jsx-runtime'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable'

export default function ProjectsLayout({
  breadcrumbs,
  headerContent,
  left,
  right,
}: React.PropsWithChildren<{
  breadcrumbs?: {
    href?: string
    label: string
  }[]
  left: React.ReactElement
  right?: React.ReactElement
  headerContent?: React.ReactElement
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ResizablePanelGroup className="w-full" direction="horizontal">
          <ResizablePanel defaultSize={45}>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b pr-3">
              <div className="flex items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs?.map((breadcrumb, key) => (
                      <Fragment key={key}>
                        {key !== 0 && <BreadcrumbSeparator />}

                        <BreadcrumbItem>
                          {breadcrumb.href ? (
                            <BreadcrumbLink href={breadcrumb.href}>
                              {breadcrumb.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              {headerContent}
            </header>
            {left}
          </ResizablePanel>
          {right ? <ResizableHandle /> : null}
          {right ? <ResizablePanel defaultSize={55}>{right}</ResizablePanel> : null}
        </ResizablePanelGroup>
      </SidebarInset>
    </SidebarProvider>
  )
}
