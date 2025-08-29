"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, MapPin, Phone, Mail, Calendar, Shield, Trash2, User, Edit } from "lucide-react"
import { mockCustomers, mockDevices, validatePhoneNumber } from "@/lib/mock-data"
import type { Customer, Device, PersonToNotify } from "@/types"

export default function ClientsPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [devices, setDevices] = useState<Device[]>(mockDevices)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
  })
  const [editCustomer, setEditCustomer] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
  })
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [deviceLocation, setDeviceLocation] = useState("")
  const [notificationList, setNotificationList] = useState<PersonToNotify[]>([])
  const [newContact, setNewContact] = useState({ name: "", phoneNumber: "" })
  const [contactErrors, setContactErrors] = useState({ name: "", phoneNumber: "" })
  const [formErrors, setFormErrors] = useState({ device: "", location: "", contacts: "", name: "", email: "", phoneNumber: "", locationField: "" })

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const validateCustomer = (customer: typeof newCustomer) => {
    const errors = { name: "", phoneNumber: "", location: "", email: "" }
    if (!customer.name.trim()) errors.name = "Organization name is required"
    if (!customer.phoneNumber.trim()) errors.phoneNumber = "Phone number is required"
    else if (!validatePhoneNumber(customer.phoneNumber)) errors.phoneNumber = "Invalid phone number format"
    if (!customer.location.trim()) errors.location = "Location is required"
    if (customer.email && !/\S+@\S+\.\S+/.test(customer.email)) errors.email = "Invalid email format"
    return errors
  }

  const handleAddCustomer = () => {
    const errors = validateCustomer(newCustomer)
    if (Object.values(errors).some((error) => error)) {
      setFormErrors({ ...formErrors, ...errors, locationField: errors.location })
      return
    }

    const customer: Customer = {
      _id: Date.now().toString(),
      name: newCustomer.name,
      email: newCustomer.email || undefined,
      phoneNumber: newCustomer.phoneNumber,
      location: newCustomer.location,
      devices: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setCustomers([...customers, customer])
    setNewCustomer({ name: "", email: "", phoneNumber: "", location: "" })
    setFormErrors({ device: "", location: "", contacts: "", name: "", email: "", phoneNumber: "", locationField: "" })
    setIsAddDialogOpen(false)
  }

  const handleEditCustomer = () => {
    if (!customerToEdit) return

    const errors = validateCustomer(editCustomer)
    if (Object.values(errors).some((error) => error)) {
      setFormErrors({ ...formErrors, ...errors, locationField: errors.location })
      return
    }

    const updatedCustomer = {
      ...customerToEdit,
      name: editCustomer.name,
      email: editCustomer.email || undefined,
      phoneNumber: editCustomer.phoneNumber,
      location: editCustomer.location,
      updatedAt: new Date().toISOString(),
    }

    setCustomers(customers.map((customer) => (customer._id === customerToEdit._id ? updatedCustomer : customer)))

    if (selectedCustomer && selectedCustomer._id === customerToEdit._id) {
      setSelectedCustomer(updatedCustomer)
    }

    setIsEditDialogOpen(false)
    setCustomerToEdit(null)
    setFormErrors({ device: "", location: "", contacts: "", name: "", email: "", phoneNumber: "", locationField: "" })
  }

  const handleEditClick = (customer: Customer) => {
    setCustomerToEdit(customer)
    setEditCustomer({
      name: customer.name,
      email: customer.email || "",
      phoneNumber: customer.phoneNumber,
      location: customer.location,
    })
    setIsEditDialogOpen(true)
  }

  const validateContact = (contact: { name: string; phoneNumber: string }) => {
    const errors = { name: "", phoneNumber: "" }
    if (!contact.name.trim()) errors.name = "Name is required"
    if (!contact.phoneNumber.trim()) errors.phoneNumber = "Phone number is required"
    else if (!validatePhoneNumber(contact.phoneNumber)) errors.phoneNumber = "Phone number must start with 0 and be exactly 10 digits"
    return errors
  }

  const validateAssignmentForm = () => {
    const errors = { device: "", location: "", contacts: "" }
    if (!selectedDeviceId) errors.device = "Please select a device"
    if (!deviceLocation.trim()) errors.location = "Device location is required"
    if (notificationList.length === 0) errors.contacts = "At least one notification contact is required"
    setFormErrors({ ...formErrors, ...errors })
    return !errors.device && !errors.location && !errors.contacts
  }

  const handleAddContact = () => {
    const errors = validateContact(newContact)
    setContactErrors(errors)
    if (errors.name || errors.phoneNumber) return

    const isDuplicate = notificationList.some((contact) => contact.phoneNumber === newContact.phoneNumber)
    if (isDuplicate) {
      setContactErrors({ ...errors, phoneNumber: "This phone number is already added" })
      return
    }

    setNotificationList([...notificationList, { ...newContact }])
    setNewContact({ name: "", phoneNumber: "" })
    setContactErrors({ name: "", phoneNumber: "" })
    if (formErrors.contacts) setFormErrors({ ...formErrors, contacts: "" })
  }

  const handleRemoveContact = (index: number) => {
    setNotificationList(notificationList.filter((_, i) => i !== index))
  }

  const handleAssignDevice = () => {
    if (!validateAssignmentForm() || !selectedCustomer) return

    setDevices(
      devices.map((device) =>
        device._id === selectedDeviceId
          ? {
              ...device,
              isUsed: true,
              customerId: selectedCustomer._id,
              customerName: selectedCustomer.name,
              location: deviceLocation,
              status: "active" as const,
              listToBeNotified: notificationList,
            }
          : device,
      ),
    )

    setCustomers(
      customers.map((customer) =>
        customer._id === selectedCustomer._id
          ? { ...customer, devices: [...customer.devices, selectedDeviceId] }
          : customer,
      ),
    )

    resetAssignmentForm()
    setIsDeviceDialogOpen(false)
  }

  const handleRemoveDevice = (deviceId: string) => {
    if (!selectedCustomer) return

    setDevices(
      devices.map((device) =>
        device._id === deviceId
          ? {
              ...device,
              isUsed: false,
              customerId: undefined,
              customerName: undefined,
              status: "inactive" as const,
              location: undefined,
              listToBeNotified: undefined,
            }
          : device,
      ),
    )

    setCustomers(
      customers.map((customer) =>
        customer._id === selectedCustomer._id
          ? { ...customer, devices: customer.devices.filter((id) => id !== deviceId) }
          : customer,
      ),
    )

    setSelectedCustomer({
      ...selectedCustomer,
      devices: selectedCustomer.devices.filter((id) => id !== deviceId),
    })
  }

  const getCustomerDevices = (customerId: string) => {
    return devices.filter((device) => device.customerId === customerId)
  }

  const getUnusedDevices = () => {
    return devices.filter((device) => !device.isUsed)
  }

  const getActiveDeviceCount = (customerId: string) => {
    return devices.filter((device) => device.customerId === customerId && device.status === "active").length
  }

  const resetAssignmentForm = () => {
    setSelectedDeviceId("")
    setDeviceLocation("")
    setNotificationList([])
    setNewContact({ name: "", phoneNumber: "" })
    setContactErrors({ name: "", phoneNumber: "" })
    setFormErrors({ device: "", location: "", contacts: "", name: "", email: "", phoneNumber: "", locationField: "" })
  }

  const customerDevices = selectedCustomer ? getCustomerDevices(selectedCustomer._id) : []

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>Update client information and contact details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Organization Name</Label>
              <Input
                id="editName"
                value={editCustomer.name}
                onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                placeholder="Enter organization name"
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEmail">Email (Optional)</Label>
              <Input
                id="editEmail"
                type="email"
                value={editCustomer.email}
                onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                placeholder="Enter email address"
                className={formErrors.email ? "border-red-500" : ""}
              />
              {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPhone">Phone Number</Label>
              <Input
                id="editPhone"
                value={editCustomer.phoneNumber}
                onChange={(e) => setEditCustomer({ ...editCustomer, phoneNumber: e.target.value })}
                placeholder="Enter phone number"
                className={formErrors.phoneNumber ? "border-red-500" : ""}
              />
              {formErrors.phoneNumber && <p className="text-sm text-red-500">{formErrors.phoneNumber}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                value={editCustomer.location}
                onChange={(e) => setEditCustomer({ ...editCustomer, location: e.target.value })}
                placeholder="Enter location"
                className={formErrors.locationField ? "border-red-500" : ""}
              />
              {formErrors.locationField && <p className="text-sm text-red-500">{formErrors.locationField}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCustomer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedCustomer ? (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => setSelectedCustomer(null)}>
                ← Back to Clients
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">{selectedCustomer.name}</h1>
              <p className="text-muted-foreground">{selectedCustomer.location}</p>
            </div>
            <Dialog
              open={isDeviceDialogOpen}
              onOpenChange={(open) => {
                setIsDeviceDialogOpen(open)
                if (!open) resetAssignmentForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Device
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Assign Device to {selectedCustomer.name}</DialogTitle>
                  <DialogDescription>Select and configure a device for this client.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client (Pre-selected)</Label>
                    <Input
                      id="client"
                      value={`${selectedCustomer.name} - ${selectedCustomer.location}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="device">Available Devices *</Label>
                    <Select
                      value={selectedDeviceId}
                      onValueChange={(value) => {
                        setSelectedDeviceId(value)
                        if (formErrors.device) setFormErrors({ ...formErrors, device: "" })
                      }}
                    >
                      <SelectTrigger className={formErrors.device ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select a device" />
                      </SelectTrigger>
                      <SelectContent>
                        {getUnusedDevices().map((device) => (
                          <SelectItem key={device._id} value={device._id}>
                            {device.serialNumber} - Battery: {device.batteryLevel || 0}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.device && <p className="text-sm text-red-500">{formErrors.device}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Device Location *</Label>
                    <Input
                      id="location"
                      value={deviceLocation}
                      onChange={(e) => {
                        setDeviceLocation(e.target.value)
                        if (formErrors.location) setFormErrors({ ...formErrors, location: "" })
                      }}
                      placeholder="e.g., North Boundary - Sector A"
                      className={formErrors.location ? "border-red-500" : ""}
                      required
                    />
                    {formErrors.location && <p className="text-sm text-red-500">{formErrors.location}</p>}
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label>Notification Contacts *</Label>
                      {formErrors.contacts && <p className="text-sm text-red-500 mt-1">{formErrors.contacts}</p>}
                    </div>
                    <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="contactName">Contact Name</Label>
                          <Input
                            id="contactName"
                            placeholder="Enter contact name"
                            value={newContact.name}
                            onChange={(e) => {
                              setNewContact({ ...newContact, name: e.target.value })
                              if (contactErrors.name) setContactErrors({ ...contactErrors, name: "" })
                            }}
                            className={contactErrors.name ? "border-red-500" : ""}
                          />
                          {contactErrors.name && <p className="text-sm text-red-500">{contactErrors.name}</p>}
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="contactPhone">Phone Number</Label>
                          <Input
                            id="contactPhone"
                            placeholder="0712345678"
                            value={newContact.phoneNumber}
                            onChange={(e) => {
                              setNewContact({ ...newContact, phoneNumber: e.target.value })
                              if (contactErrors.phoneNumber) setContactErrors({ ...contactErrors, phoneNumber: "" })
                            }}
                            className={contactErrors.phoneNumber ? "border-red-500" : ""}
                          />
                          {contactErrors.phoneNumber && <p className="text-sm text-red-500">{contactErrors.phoneNumber}</p>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddContact}
                        className="w-full md:w-auto"
                        disabled={!newContact.name.trim() && !newContact.phoneNumber.trim()}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Contact
                      </Button>
                    </div>
                    {notificationList.length > 0 && (
                      <div className="space-y-2">
                        <Label>Added Contacts ({notificationList.length})</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {notificationList.map((contact, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-background p-3 rounded border"
                            >
                              <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <span className="text-sm font-medium">{contact.name}</span>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    {contact.phoneNumber}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveContact(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeviceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAssignDevice}>Assign Device</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerDevices.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerDevices.filter((d) => d.status === "active").length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Battery</CardTitle>
                <div className="h-2 w-2 rounded-full bg-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerDevices.filter((d) => (d.batteryLevel || 0) < 30).length}</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Client Devices</CardTitle>
              <CardDescription>Devices assigned to {selectedCustomer.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Contacts</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerDevices.map((device) => (
                    <TableRow key={device._id}>
                      <TableCell>
                        <div className="font-medium">{device.serialNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {device.location || "Not set"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{device.batteryLevel || 0}%</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={device.status === "active" ? "default" : "secondary"}>{device.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "Never"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {device.listToBeNotified?.length || 0} contacts
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveDevice(device._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
              <p className="text-muted-foreground">Manage your conservation partners and their monitoring systems</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                  <DialogDescription>Add a new conservation partner to the eleGuard system.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="Enter organization name"
                      className={formErrors.name ? "border-red-500" : ""}
                    />
                    {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="Enter email address"
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phoneNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                      placeholder="Enter phone number"
                      className={formErrors.phoneNumber ? "border-red-500" : ""}
                    />
                    {formErrors.phoneNumber && <p className="text-sm text-red-500">{formErrors.phoneNumber}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newCustomer.location}
                      onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                      placeholder="Enter location"
                      className={formErrors.locationField ? "border-red-500" : ""}
                    />
                    {formErrors.locationField && <p className="text-sm text-red-500">{formErrors.locationField}</p>}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomer}>Add Client</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Client Directory</CardTitle>
                  <CardDescription>{filteredCustomers.length} conservation partners</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Devices</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => {
                    const totalDevices = customer.devices.length
                    const activeDevices = getActiveDeviceCount(customer._id)
                    return (
                      <TableRow key={customer._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            {customer.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {customer.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {activeDevices}/{totalDevices} active
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={activeDevices > 0 ? "default" : "secondary"}>
                            {activeDevices > 0 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditClick(customer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                              View Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}