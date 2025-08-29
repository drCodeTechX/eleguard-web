"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Download, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { mockBillingInfo } from "@/lib/mock-data"

export default function BillingPage() {
  const totalRevenue = mockBillingInfo.reduce((sum, billing) => sum + billing.totalAmount, 0)
  const activeSubscriptions = mockBillingInfo.filter((b) => b.status === "active").length

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage client subscriptions and billing information</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">All clients current</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No overdue accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Feb 1</div>
            <p className="text-xs text-muted-foreground">7 days remaining</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Client Billing Overview</CardTitle>
              <CardDescription>Current subscription status for all clients</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Billing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBillingInfo.map((billing) => (
                <TableRow key={billing._id}>
                  <TableCell>
                    <div className="font-medium">{billing.customerName}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {billing.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {billing.currentDevices}/{billing.devicesIncluded} included
                      </div>
                      <Progress value={(billing.currentDevices / billing.devicesIncluded) * 100} className="w-16 h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${billing.totalAmount}</div>
                    {billing.currentDevices > billing.devicesIncluded && (
                      <div className="text-xs text-muted-foreground">
                        +${(billing.currentDevices - billing.devicesIncluded) * billing.additionalDeviceFee} extra
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        billing.status === "active"
                          ? "default"
                          : billing.status === "overdue"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {billing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(billing.nextBillingDate).toLocaleDateString()}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Plan</CardTitle>
            <CardDescription>Perfect for small conservation areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$149</div>
            <p className="text-sm text-muted-foreground mb-4">per month</p>
            <ul className="space-y-2 text-sm">
              <li>• Up to 3 devices</li>
              <li>• Basic monitoring</li>
              <li>• Email alerts</li>
              <li>• Monthly reports</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Premium Plan</CardTitle>
            <CardDescription>Ideal for medium-sized operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$299</div>
            <p className="text-sm text-muted-foreground mb-4">per month</p>
            <ul className="space-y-2 text-sm">
              <li>• Up to 5 devices</li>
              <li>• Advanced analytics</li>
              <li>• SMS + Email alerts</li>
              <li>• Weekly reports</li>
              <li>• Priority support</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enterprise Plan</CardTitle>
            <CardDescription>For large conservation networks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$599</div>
            <p className="text-sm text-muted-foreground mb-4">per month</p>
            <ul className="space-y-2 text-sm">
              <li>• Up to 10 devices</li>
              <li>• Real-time monitoring</li>
              <li>• Custom integrations</li>
              <li>• Daily reports</li>
              <li>• 24/7 support</li>
              <li>• API access</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
