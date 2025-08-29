"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User, Shield, Trash2, Plus, AlertCircle, CheckCircle, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { mockUsers, mockInvitations, generateOTP, addInvitation } from "@/lib/mock-data"
import type { User as UserType, InvitationData } from "@/types"

export default function SettingsPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserType[]>(mockUsers)
  const [invitations, setInvitations] = useState<InvitationData[]>(mockInvitations)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [makeAdmin, setMakeAdmin] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!currentUser) return null

  const handleSendInvitation = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    // create invitation and add to mock data
    const invitation = { email: newUserEmail, otp: generateOTP(), createdBy: currentUser._id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
    addInvitation(invitation)
    setInvitations([...invitations, invitation])
    setSuccess(`Invitation sent to ${newUserEmail}`)
    setNewUserEmail("")
    setMakeAdmin(false)
    setIsAddUserDialogOpen(false)
    setIsLoading(false)
  }

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find((u) => u._id === userId)
    if (!userToDelete) return

    // Super admin can delete anyone
    if (currentUser.isSuperAdmin) {
      setUsers(users.filter((u) => u._id !== userId))
      return
    }

    // Regular admin can only delete users they created
    if (currentUser.isAdmin && userToDelete.createdBy === currentUser._id) {
      setUsers(users.filter((u) => u._id !== userId))
      return
    }
  }

  const handleToggleAdmin = (userId: string) => {
    // Only super admin can toggle admin status
    if (!currentUser.isSuperAdmin) return

    setUsers(
      users.map((user) =>
        user._id === userId
          ? {
              ...user,
              isAdmin: !user.isAdmin,
              isSuperAdmin: false, // Can't make someone super admin through toggle
            }
          : user,
      ),
    )
  }

  const canDeleteUser = (user: UserType) => {
    if (user._id === currentUser._id) return false // Can't delete self
    if (currentUser.isSuperAdmin) return true
    if (currentUser.isAdmin && user.createdBy === currentUser._id) return true
    return false
  }

  const canToggleAdmin = (user: UserType) => {
    if (user._id === currentUser._id) return false // Can't modify self
    if (user.isSuperAdmin) return false // Can't modify super admin
    return currentUser.isSuperAdmin
  }

  const getVisibleUsers = () => {
    if (currentUser.isSuperAdmin) {
      return users // Super admin sees all users
    }
    if (currentUser.isAdmin) {
      // Regular admin sees users they created + themselves
      return users.filter((u) => u.createdBy === currentUser._id || u._id === currentUser._id)
    }
    return [currentUser] // Regular users only see themselves
  }

  const groupUsersByCreator = (users: UserType[]) => {
    if (!currentUser.isSuperAdmin) {
      return [{ creatorName: "Your Users", users }]
    }

    const groups: { creatorName: string; users: UserType[] }[] = []
    const userMap = new Map<string, UserType[]>()

    users.forEach((user) => {
      if (!user.createdBy) {
        // Root users (super admins)
        if (!userMap.has("root")) {
          userMap.set("root", [])
        }
        userMap.get("root")!.push(user)
      } else {
        const creator = users.find((u) => u._id === user.createdBy)
        const creatorName = creator ? creator.name : "Unknown"
        if (!userMap.has(user.createdBy)) {
          userMap.set(user.createdBy, [])
        }
        userMap.get(user.createdBy)!.push(user)
      }
    })

    // Add root users first
    if (userMap.has("root")) {
      groups.push({
        creatorName: "System Administrators",
        users: userMap.get("root")!,
      })
    }

    // Add other groups
    userMap.forEach((groupUsers, creatorId) => {
      if (creatorId !== "root") {
        const creator = users.find((u) => u._id === creatorId)
        groups.push({
          creatorName: `Created by ${creator?.name || "Unknown"}`,
          users: groupUsers,
        })
      }
    })

    return groups
  }

  const visibleUsers = getVisibleUsers()
  const userGroups = groupUsersByCreator(visibleUsers)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and system preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={currentUser.name} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue={currentUser.email} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue={`0${currentUser.phoneNumber}`} />
              <p className="text-xs text-muted-foreground">Must start with 0 and be exactly 10 digits</p>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* User Management - Only visible to admins */}
        {(currentUser.isAdmin || currentUser.isSuperAdmin) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    {currentUser.isSuperAdmin
                      ? "Manage all system users and their permissions"
                      : "Manage users you have created"}
                  </CardDescription>
                </div>
                <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Invite User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite New User</DialogTitle>
                      <DialogDescription>
                        Send an invitation email with OTP to create a new user account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="userEmail">Email Address</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                      {currentUser.isSuperAdmin && (
                        <div className="flex items-center space-x-2">
                          <Switch id="makeAdmin" checked={makeAdmin} onCheckedChange={setMakeAdmin} />
                          <Label htmlFor="makeAdmin">Grant administrator privileges</Label>
                        </div>
                      )}
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendInvitation} disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Invitation"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {userGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">{group.creatorName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {group.users.length} user{group.users.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <div className="font-medium">{user.name}</div>
                            {user._id === currentUser._id && (
                              <div className="text-xs text-blue-600 font-medium">You</div>
                            )}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>0{user.phoneNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={user.isSuperAdmin ? "default" : user.isAdmin ? "secondary" : "outline"}>
                                {user.isSuperAdmin ? "Super Admin" : user.isAdmin ? "Admin" : "User"}
                              </Badge>
                              {canToggleAdmin(user) && (
                                <Button variant="ghost" size="sm" onClick={() => handleToggleAdmin(user._id)}>
                                  {user.isAdmin ? "Remove Admin" : "Make Admin"}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {canDeleteUser(user) && (
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {groupIndex < userGroups.length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Show pending invitations for admins */}
        {(currentUser.isAdmin || currentUser.isSuperAdmin) && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Users who have been invited but haven't completed registration</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>OTP</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Invited By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations
                    .filter((inv) => currentUser.isSuperAdmin || inv.createdBy === currentUser._id)
                    .map((invitation, index) => (
                      <TableRow key={index}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell className="font-mono">{invitation.otp}</TableCell>
                        <TableCell>{new Date(invitation.expiresAt).toLocaleString()}</TableCell>
                        <TableCell>{users.find((u) => u._id === invitation.createdBy)?.name || "Unknown"}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
