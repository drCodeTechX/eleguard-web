"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, AlertCircle, CheckCircle } from "lucide-react"
import { mockUsers, findInvitation, removeInvitation} from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import type { User } from "@/types"

export default function SignupPage() {
  const [step, setStep] = useState<"invitation" | "details">("invitation")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    isAdmin: false,
    createdBy: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleInvitationVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const invited = findInvitation(email, otp)

    if (!invited) {
      setError('Invalid invitation or OTP')
      setIsLoading(false)
      return
    }

    setUserDetails({...userDetails, email: invited.email, createdBy: invited.createdBy});
    setStep("details");
    setIsLoading(false);
  }

  const handleUserRegistration = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // // Validate phone number
    // if (!validatePhoneNumber(userDetails.phoneNumber)) {
    //   setError("Phone number must start with 0 and be exactly 10 digits")
    //   setIsLoading(false)
    //   return
    // }
    

    // Validate password
    if (userDetails.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    //Check the similarity of passwords
    if (userDetails.password !== userDetails.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Add user to mockUsers
    const newUser: User = {
      _id: String(Date.now()),
      name: userDetails.name,
      email: userDetails.email,
      phoneNumber: Number(userDetails.phoneNumber),
      isAdmin: userDetails.isAdmin,
      createdBy: userDetails.createdBy,
      isVerified: true,
      password: userDetails.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // @ts-ignore
    mockUsers.push(newUser)
    // Remove the used invitation
    removeInvitation(email, otp)

    // Auto-login the new user
    await login(email, userDetails.password)
    setIsLoading(false)
    router.push("/")
  }

  if (step === "details") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>Fill in your details to complete registration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUserRegistration} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={userDetails.phoneNumber}
                  onChange={(e) => setUserDetails({ ...userDetails, phoneNumber: e.target.value })}
                  placeholder="0712345678"
                  required
                />
                <p className="text-xs text-muted-foreground">Must start with 0 and be exactly 10 digits</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={userDetails.password}
                  onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={userDetails.confirmPassword}
                  onChange={(e) => setUserDetails({ ...userDetails, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
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
                {isLoading ? "Creating Account..." : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Join eleGuard</CardTitle>
          <CardDescription>Enter your invitation details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvitationVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Invitation OTP</Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
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
              {isLoading ? "Verifying..." : "Verify Invitation"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" className="p-0" onClick={() => router.push("/login")}>
                Sign in
              </Button>
            </p>
          </div>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Test Invitation:</p>
            <div className="space-y-1 text-xs">
              <p>
                <strong>Email:</strong> test@example.com
              </p>
              <p>
                <strong>OTP:</strong> 123456
              </p>
              <p className="text-muted-foreground">Use these credentials to test signup</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
