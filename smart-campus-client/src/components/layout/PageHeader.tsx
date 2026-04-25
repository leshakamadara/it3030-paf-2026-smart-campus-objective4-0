import * as React from "react"
import { Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs: {
    label: string
    href?: string
  }[]
  action?: React.ReactNode
}

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="border-b bg-[#ffffff] border-[#e6e6e6]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <Breadcrumb className="mb-2">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <React.Fragment key={item.label}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-[#8a8f98] font-normal">{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-[#191a1b]" style={{ letterSpacing: "-0.4px" }}>
              {title}
            </h1>
            {description && (
              <p className="text-sm mt-0.5 text-[#8a8f98]">
                {description}
              </p>
            )}
          </div>
          
          {action && (
            <div className="flex items-center gap-2">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
