"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle, Clock, Search } from "lucide-react"
import { useEffect } from "react"
import type { Alert as AlertType } from "@/types"
import { mockAlerts } from '@/lib/mock-data'
import { useAuth } from "@/lib/auth-context"

export default function AlertsPage() {

  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const user  = useAuth().user;

  const getAlerts = async () => {
    return Promise.resolve(mockAlerts)
  }

  // Fetch alerts on mount
  useEffect(() => {
    getAlerts().then((data) => setAlerts(data))
     
  }, [])

  const getSeverityColor = (severity: AlertType["severity"]) => {
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

  const getSeverityIcon = (severity: AlertType["severity"]) => {
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

  const handleAcknowledge = (alertId: string) => {
    //todo: Update in the db also

    //updates in the UI without fetching
    setAlerts(
      alerts.map((alert) =>
        alert._id === alertId
          ? {
              ...alert,
              acknowledged: true,
              acknowledgedBy: user?.name,
              acknowledgedAt: new Date().toISOString(),
            }
          : alert,
      ),
    )
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "acknowledged" && alert.acknowledged) ||
      (statusFilter === "unacknowledged" && !alert.acknowledged)

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">Monitor and manage system alerts from your HEC devices</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <div className="h-2 w-2 rounded-full bg-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unacknowledged</CardTitle>
            <div className="h-2 w-2 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unacknowledgedAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length - unacknowledgedAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>All alerts from your monitoring devices</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Alert key={alert._id}>
                <div className="flex items-start gap-3 w-full">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        <Badge variant="outline">{alert.type.replace("_", " ")}</Badge>
                      </div>
                      {!alert.acknowledged && (
                        <Button size="sm" variant="outline" onClick={() => handleAcknowledge(alert._id)}>
                          Acknowledge
                        </Button>
                      )}
                    </div>
                    <AlertDescription className="text-xs text-muted-foreground">
                      {alert.location} • {new Date(alert.timestamp).toLocaleString()}
                    </AlertDescription>
                    {alert.acknowledged && (
                      <p className="text-xs text-green-600">
                        ✓ Acknowledged by {alert.acknowledgedBy} on{" "}
                        {alert.acknowledgedAt && new Date(alert.acknowledgedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No alerts match your current filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
