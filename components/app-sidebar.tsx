"use client"

import type * as React from "react"
import { Building2, CreditCard, Home, Settings, Shield, Sun, Moon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Elephant SVG Component
function ElephantIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.5 2 6 4.5 6 8c0 1.5.5 3 1.5 4.5L6 14c-1 0-2 1-2 2v4c0 1 1 2 2 2h2v-4h1l1.5-2c.5.5 1 1 1.5 1.5V20c0 1 1 2 2 2s2-1 2-2v-2.5c.5-.5 1-1 1.5-1.5L19 18h1v4h2c1 0 2-1 2-2v-4c0-1-1-2-2-2l-1.5-1.5C21.5 11 22 9.5 22 8c0-3.5-2.5-6-6-6-1.5 0-3 .5-4 1.5C11 3.5 9.5 3 8 3c-2 0-3.5 1.5-3.5 3.5 0 1 .5 2 1.5 2.5.5-1.5 1.5-3 3-4C9.5 4.5 10.5 4 12 4c1.5 0 3 .5 4 1.5 1-1 2.5-1.5 4-1.5 2.5 0 4.5 2 4.5 4.5 0 1-.5 2-1.5 2.5-.5-1.5-1.5-3-3-4z" />
      <circle cx="9" cy="7" r="1" />
      <circle cx="15" cy="7" r="1" />
    </svg>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  if (!user) return null

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      roles: ["user", "admin", "superAdmin"],
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Building2,
      roles: ["admin", "superAdmin"],
    },
    {
      title: "Devices",
      url: "/devices",
      icon: Shield,
      roles: ["admin", "superAdmin"],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      roles: ["user", "admin", "superAdmin"],
    },
    {
      title: "Billing",
      url: "/billing",
      icon: CreditCard,
      roles: ["admin", "superAdmin"],
    },
  ]

  const getUserRole = () => {
    if (user.isSuperAdmin) return "superAdmin"
    if (user.isAdmin) return "admin"
    return "user"
  }

  const userRole = getUserRole()
  const filteredNavigation = navigationItems.filter((item) => item.roles.includes(userRole))

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-lg">eleGuard</span>
            <span className="text-xs text-muted-foreground">HEC Management</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url} className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/10"}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ElephantIcon className="h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">eleGuard v1.0</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted/10"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
