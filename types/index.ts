export interface User {
  _id: string
  name: string
  email: string
  phoneNumber: number
  password?: string
  isAdmin: boolean
  isSuperAdmin?: boolean // The big admin
  createdBy?: string // ID of the admin who created this user
  createdUsers?: string[] // Array of user IDs this admin has created
  deviceId?: string
  invitationOTP?: string
  invitationExpiry?: string
  isVerified?: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  _id: string
  name: string
  email?: string
  phoneNumber: string // Changed to string for format validation
  location: string
  devices: string[]
  createdAt: string
  updatedAt: string
}

export interface Device {
  _id: string
  serialNumber: string
  isUsed: boolean
  customerId?: string
  customerName?: string
  location?: string // Location is now required when adding
  batteryLevel?: number
  lastSeen?: string
  status: "active" | "inactive" | "maintenance"
  listToBeNotified?: PersonToNotify[]
  createdAt: string
  updatedAt: string
}

export interface PersonToNotify {
  name: string
  phoneNumber: string // Changed to string for format validation
}

export interface Alert {
  _id: string
  deviceId: string
  customerId?: string
  type: "intrusion" | "low_battery" | "device_offline" | "maintenance"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  location: string
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

export interface DashboardMetrics {
  totalCustomers: number
  totalDevices: number
  usedDevices: number
  unusedDevices: number
  totalAlerts: number
  criticalAlerts: number
  recentAlerts: Alert[]
  deviceUsageDistribution: {
    used: number
    unused: number
  }
  topClients: {
    name: string
    deviceCount: number
    location: string
  }[]
}

export interface BillingInfo {
  _id: string
  customerId: string
  customerName: string
  plan: "basic" | "premium" | "enterprise"
  monthlyFee: number
  devicesIncluded: number
  additionalDeviceFee: number
  currentDevices: number
  lastBillingDate: string
  nextBillingDate: string
  status: "active" | "overdue" | "suspended"
  totalAmount: number
}

export interface InvitationData {
  email: string
  otp: string
  createdBy: string
  expiresAt: string
}
