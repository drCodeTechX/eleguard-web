"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/types"
import { mockUsers } from "@/lib/mock-data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("currentUser")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const publicRoutes = ["/login", "/signup"]
    const isPublicRoute = publicRoutes.includes(pathname)

    if (!isLoading) {
      if (!user && !isPublicRoute) {
        router.replace("/login")
      } else if (user && isPublicRoute) {
        router.replace("/")
      }
    }
  }, [user, pathname, isLoading, router])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    try {
      // Use in-app mock data to authenticate
      const foundUser = mockUsers.find((u) => u.email === email)
      if (!foundUser) {
        const apiMessage = "Invalid email or user not verified"
        try { localStorage.setItem("authError", apiMessage) } catch (e) {}
        router.replace("/login")
        return { success: false, error: apiMessage }
      }

      // If password field exists on mock user, validate; otherwise accept any password
      // (mock users in db.json use password: "password123")
      // @ts-ignore
      const expected = (foundUser as any).password
      if (expected && password !== expected) {
        const apiMessage = "Incorrect password"
        try { localStorage.setItem("authError", apiMessage) } catch (e) {}
        router.replace("/login")
        return { success: false, error: apiMessage }
      }

      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return { success: true }
    } catch (err: any) {
      console.error("Login error:", err)
      const message = err?.response?.data?.message || err?.message || "Login failed"
      try {
        localStorage.setItem("authError", message)
      } catch (e) {}
      router.replace("/login")
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
    router.replace("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
