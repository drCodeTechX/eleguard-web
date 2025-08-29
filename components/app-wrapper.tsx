"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { UserAvatar } from "@/components/user-avatar"

interface AppWrapperProps {
  children: React.ReactNode
}

export function AppWrapper({ children }: AppWrapperProps) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  const publicRoutes = ["/login", "/signup"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Public routes (login/signup) - no layout
  if (isPublicRoute) {
    return <div className="min-h-screen">{children}</div>
  }

  // If user is not authenticated, show login page content
  if (!user) {
    return <div className="min-h-screen">{children}</div>
  }

  // Protected routes with sidebar layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">eleGuard Dashboard</h2>
          </div>
          <UserAvatar />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
