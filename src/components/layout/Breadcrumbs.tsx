import React from 'react'
import Link from 'next/link'
import { localizedHref } from '@/lib/localizedPaths'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  locale: string
  extra?: React.ReactNode
}

export default function Breadcrumbs({ items, locale, extra }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-[12px] text-slate-500 py-3 overflow-x-auto no-scrollbar whitespace-nowrap">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link 
                  href={localizedHref(locale, item.href)}
                  className="hover:text-primary transition-colors hover:underline underline-offset-4"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-slate-900 font-bold" : ""}>
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-slate-300 font-light px-0.5">›</span>}
            </div>
          </React.Fragment>
        )
      })}
      {extra && <div className="ml-auto flex-shrink-0">{extra}</div>}
    </nav>
  )
}
