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
  /** Small uppercase label above the title (e.g. "HELAUNI.APP" or "ADMIN") */
  label?: string
  title: string
  description?: string
  breadcrumbs: {
    label: string
    href?: string
  }[]
  action?: React.ReactNode
}

export function PageHeader({ label, title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="border-b border-[#d0d6e0] bg-[#ffffff]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <React.Fragment key={item.label}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-[#8a8f98] font-[400]">{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink asChild>
                        <Link
                          to={item.href}
                          className="text-[#62666d] hover:text-[#191a1b] transition-colors"
                        >
                          {item.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-[#8a8f98] font-[400]">{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {label && (
              <p className="mb-1 text-[10px] font-[510] uppercase tracking-[0.2em] text-[#7170ff]">
                {label}
              </p>
            )}
            <h1
              className="text-2xl font-[590] text-[#191a1b]"
              style={{ letterSpacing: "-0.44px" }}
            >
              {title}
            </h1>
            {description && (
              <p className="mt-1 max-w-2xl text-sm text-[#62666d]">{description}</p>
            )}
          </div>

          {action && (
            <div className="flex shrink-0 items-center gap-2">
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
