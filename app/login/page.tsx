"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, Copy } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  // If AuthProvider saved an auth error (e.g. from failed login/network issue), show it here
  useEffect(() => {
    try {
      const stored = localStorage.getItem("authError")
      if (stored) {
        setError(stored)
        localStorage.removeItem("authError")
        setIsLoading(false)
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await login(email, password)

    if (result.success) {
      router.push("/")
    } else {
      setError(result.error || "Login failed")
    }

    setIsLoading(false)
  }

  // const copyToClipboard = (text: string) => {
  //   navigator.clipboard.writeText(text)
  // }

  // const demoAccounts = [
  //   {
  //     role: "Super Admin",
  //     email: "john@eleguard.com",
  //     description: "Full system access, can manage all users and settings",
  //     color: "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800",
  //   },
  //   {
  //     role: "Admin",
  //     email: "sarah@eleguard.com",
  //     description: "Can manage users they created, limited admin access",
  //     color: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  //   },
  //   {
  //     role: "User",
  //     email: "alice@eleguard.com",
  //     description: "Basic access, profile management only",
  //     color: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
  //   },
  // ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">eleGuard Login</CardTitle>
          <CardDescription>Sign in to your HEC management account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => router.push("/signup")}>
                Sign up with invitation
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



{/* Demo Credentials */}
{/* <div className="space-y-4">
  <div className="text-center mb-6">
    <h3 className="text-lg font-semibold">Demo Accounts</h3>
    <p className="text-sm text-muted-foreground">Click to copy credentials</p>
  </div>
  {demoAccounts.map((account) => (
    <Card key={account.email} className={`cursor-pointer transition-all hover:shadow-md ${account.color}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm">{account.role}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => copyToClipboard(account.email)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs font-mono bg-white/50 dark:bg-black/20 px-2 py-1 rounded mb-2">
              {account.email}
            </p>
            <p className="text-xs text-muted-foreground">{account.description}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-current/20">
          <p className="text-xs text-muted-foreground">
          <p className="text-xs text-muted-foreground">
            <strong>Password:</strong> Any 6+ characters (e.g., "password123")
          </p>
        </div>
      </CardContent>
    </Card>
  ))}
</div> */}