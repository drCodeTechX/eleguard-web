// Thin wrapper: re-export authoritative mock data from db.json
// All real mock content now lives in db.json. This file only exposes typed views and helpers

import type { User, Customer, Device, Alert, DashboardMetrics, BillingInfo, InvitationData } from "@/types"
import db from "@/db.json"

// Cast imported JSON to the expected types
export const mockUsers: User[] = (db as any).users || []
export const mockInvitations: InvitationData[] = (db as any).invitations || []
export const mockCustomers: Customer[] = (db as any).customers || []
export const mockDevices: Device[] = (db as any).devices || []
export const mockAlerts: Alert[] = (db as any).alerts || []
export const mockDashboardMetrics: DashboardMetrics = (db as any).dashboardMetrics || {
  totalCustomers: 0,
  totalDevices: 0,
  usedDevices: 0,
  unusedDevices: 0,
  totalAlerts: 0,
  criticalAlerts: 0,
  recentAlerts: [],
  deviceUsageDistribution: { used: 0, unused: 0 },
  topClients: [],
}
export const mockBillingInfo: BillingInfo[] = (db as any).billingInfo || []

export const currentUser: User | null = mockUsers.length ? mockUsers[0] : null

export const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString()

export const addInvitation = (invitation: InvitationData) => {
  mockInvitations.push(invitation)
}

export const removeInvitation = (email: string, otp: string) => {
  const index = mockInvitations.findIndex((inv) => inv.email === email && inv.otp === otp)
  if (index > -1) mockInvitations.splice(index, 1)
}

export const findInvitation = (email: string, otp: string) => {
  return mockInvitations.find((inv) => inv.email === email && inv.otp === otp)
}
