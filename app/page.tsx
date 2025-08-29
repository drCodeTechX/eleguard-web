"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Shield, Users, Zap, Clock } from "lucide-react"
import { mockDashboardMetrics, mockAlerts } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import type { Alert as AlertType } from "@/types"
import { useState, useEffect } from "react"

function getSeverityColor(severity: AlertType["severity"]) {
  switch (severity) {
    case "critical":
      return "destructive"
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "secondary"
    default:
      return "default"
  }
}

function getSeverityIcon(severity: AlertType["severity"]) {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-4 w-4" />
    case "high":
      return <AlertTriangle className="h-4 w-4" />
    case "medium":
      return <Clock className="h-4 w-4" />
    case "low":
      return <CheckCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export default function Dashboard() {
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const { user } = useAuth()
  const router = useRouter()
  const metrics = mockDashboardMetrics
  const recentAlerts = alerts.slice(0, 3)

  if (!user) return null

  const getAlerts = async () => {
      return Promise.resolve(mockAlerts.slice(0, 3))
    }
  
    // Fetch recent alerts on mount
    useEffect(() => {
      getAlerts().then((data) => {
        setAlerts(data)
      })
      
    }, [])
  
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Welcome message based on user role */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">
          {user.isSuperAdmin
            ? "You have full system access as Super Administrator"
            : user.isAdmin
              ? "You have administrative privileges"
              : "Welcome to your dashboard"}
        </p>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active conservation partners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.usedDevices} used, {metrics.unusedDevices} unused
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">{metrics.criticalAlerts} critical alerts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clients</CardTitle>
            <CardDescription>Clients with most devices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.topClients.map((client, index) => (
              <div key={client.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.location}</p>
                  </div>
                </div>
                <Badge variant="secondary">{client.deviceCount} devices</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest alerts from your monitoring devices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.length > 0 ? (
              <>
                {recentAlerts.map((alert) => (
                  <Alert key={alert._id}>
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        </div>
                        <AlertDescription className="text-xs text-muted-foreground">
                          {alert.location} • {new Date(alert.timestamp).toLocaleString()}
                        </AlertDescription>
                        {alert.acknowledged && (
                          <p className="text-xs text-green-600">✓ Acknowledged by {alert.acknowledgedBy}</p>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push("/alerts")}>
                  View All Alerts
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No alerts</p>
                <Button variant="outline" className="mt-2" onClick={() => alert("Test alert functionality!")}>
                  Test Alert
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
