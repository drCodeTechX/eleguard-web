"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Plus, Search, Battery, MapPin, Clock, Shield, Phone, User, Trash2, Edit } from "lucide-react"
import { mockDevices, mockCustomers, validatePhoneNumber } from "@/lib/mock-data"
import type { Device, PersonToNotify } from "@/types"

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices) // todo1: return all devices
  const [customers] = useState(mockCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newDevice, setNewDevice] = useState({
    serialNumber: "",
  })
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedDeviceForAssignment, setSelectedDeviceForAssignment] = useState<Device | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [deviceLocation, setDeviceLocation] = useState("")
  const [notificationList, setNotificationList] = useState<PersonToNotify[]>([])
  const [newContact, setNewContact] = useState({ name: "", phoneNumber: "" })
  const [selectedDeviceForDetails, setSelectedDeviceForDetails] = useState<Device | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editDeviceLocation, setEditDeviceLocation] = useState("")
  const [editNotificationList, setEditNotificationList] = useState<PersonToNotify[]>([])
  const [editNewContact, setEditNewContact] = useState({ name: "", phoneNumber: "" })
  const [contactErrors, setContactErrors] = useState({ name: "", phoneNumber: "" })
  const [editContactErrors, setEditContactErrors] = useState({ name: "", phoneNumber: "" })
  const [formErrors, setFormErrors] = useState({ customer: "", location: "", contacts: "" })

  const usedDevices = devices.filter((d) => d.isUsed)
  const unusedDevices = devices.filter((d) => !d.isUsed)

  const filterDevices = (deviceList: Device[]) => {
    return deviceList.filter(
      (device) =>
        device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.location?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const handleAddDevice = () => {
    if (!newDevice.serialNumber.trim()) return

    const device: Device = {
      _id: Date.now().toString(), //Not used Actually
      serialNumber: newDevice.serialNumber,
      isUsed: false,
      status: "inactive",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // todo2: add Device to db
    setDevices([...devices, device]) // No fetching again, Tunaendelea tulipoishia
    setNewDevice({ serialNumber: "" })
    setIsAddDialogOpen(false)
  }

  const validateContact = (contact: { name: string; phoneNumber: string }) => {
    const errors = { name: "", phoneNumber: "" }

    if (!contact.name.trim()) {
      errors.name = "Name is required"
    }

    if (!contact.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required"
    } else if (!validatePhoneNumber(contact.phoneNumber)) {
      errors.phoneNumber = "Phone number must start with 0 and be exactly 10 digits"
    }

    return errors
  }

  const validateAssignmentForm = () => {
    const errors = { customer: "", location: "", contacts: "" }

    if (!selectedCustomerId) {
      errors.customer = "Please select a client"
    }

    if (!deviceLocation.trim()) {
      errors.location = "Device location is required"
    }

    if (notificationList.length === 0) {
      errors.contacts = "At least one notification contact is required"
    }

    setFormErrors(errors)
    return !errors.customer && !errors.location && !errors.contacts
  }

  const handleAddContact = () => {
    const errors = validateContact(newContact)
    setContactErrors(errors)

    if (errors.name || errors.phoneNumber) {
      return
    }

    // Check for duplicate phone numbers
    const isDuplicate = notificationList.some((contact) => contact.phoneNumber === newContact.phoneNumber)
    if (isDuplicate) {
      setContactErrors({ ...errors, phoneNumber: "This phone number is already added" })
      return
    }

    setNotificationList([...notificationList, { ...newContact }])
    setNewContact({ name: "", phoneNumber: "" })
    setContactErrors({ name: "", phoneNumber: "" })

    // Clear contacts error if we now have contacts
    if (formErrors.contacts) {
      setFormErrors({ ...formErrors, contacts: "" })
    }
  }

  const handleEditAddContact = () => {
    const errors = validateContact(editNewContact)
    setEditContactErrors(errors)

    if (errors.name || errors.phoneNumber) {
      return
    }

    // Check for duplicate phone numbers
    const isDuplicate = editNotificationList.some((contact) => contact.phoneNumber === editNewContact.phoneNumber)
    if (isDuplicate) {
      setEditContactErrors({ ...errors, phoneNumber: "This phone number is already added" })
      return
    }

    setEditNotificationList([...editNotificationList, { ...editNewContact }])
    setEditNewContact({ name: "", phoneNumber: "" })
    setEditContactErrors({ name: "", phoneNumber: "" })
  }

  const handleRemoveContact = (index: number) => {
    setNotificationList(notificationList.filter((_, i) => i !== index))
  }

  const handleEditRemoveContact = (index: number) => {
    setEditNotificationList(editNotificationList.filter((_, i) => i !== index))
  }

  const handleAssignDevice = () => {
    if (!validateAssignmentForm()) {
      return
    }

    const customer = customers.find((c) => c._id === selectedCustomerId)
    if (!customer) return

    // Update device
    setDevices(
      devices.map((device) =>
        device._id === selectedDeviceForAssignment!._id
          ? {
              ...device,
              isUsed: true,
              customerId: selectedCustomerId,
              customerName: customer.name,
              location: deviceLocation,
              status: "active" as const,
              listToBeNotified: notificationList,
            }
          : device,
      ),
    )

    // Reset form
    resetAssignmentForm()
    setIsAssignDialogOpen(false)
  }

  const handleEditDevice = () => {
    if (!selectedDeviceForDetails || !editDeviceLocation.trim() || editNotificationList.length === 0) {
      return
    }

    setDevices(
      devices.map((device) =>
        device._id === selectedDeviceForDetails._id
          ? {
              ...device,
              location: editDeviceLocation,
              listToBeNotified: editNotificationList,
              updatedAt: new Date().toISOString(),
            }
          : device,
      ),
    )

    // Update the selected device for details to reflect changes
    setSelectedDeviceForDetails({
      ...selectedDeviceForDetails,
      location: editDeviceLocation,
      listToBeNotified: editNotificationList,
      updatedAt: new Date().toISOString(),
    })

    resetEditForm()
    setIsEditDialogOpen(false)
  }

  const handleViewDetails = (device: Device) => {
    setSelectedDeviceForDetails(device)
    setIsDetailsDialogOpen(true)
  }

  const handleEditClick = () => {
    if (!selectedDeviceForDetails) return

    setEditDeviceLocation(selectedDeviceForDetails.location || "")
    setEditNotificationList(selectedDeviceForDetails.listToBeNotified || [])
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: Device["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "maintenance":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const resetAssignmentForm = () => {
    setSelectedDeviceForAssignment(null)
    setSelectedCustomerId("")
    setDeviceLocation("")
    setNotificationList([])
    setNewContact({ name: "", phoneNumber: "" })
    setContactErrors({ name: "", phoneNumber: "" })
    setFormErrors({ customer: "", location: "", contacts: "" })
  }

  const resetEditForm = () => {
    setEditDeviceLocation("")
    setEditNotificationList([])
    setEditNewContact({ name: "", phoneNumber: "" })
    setEditContactErrors({ name: "", phoneNumber: "" })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">Monitor and manage your HEC detection devices</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>Register a new HEC monitoring device in the system.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={newDevice.serialNumber}
                  onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                  placeholder="e.g., EG-013-2024"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDevice} disabled={!newDevice.serialNumber.trim()}>
                Add Device
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usedDevices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unused</CardTitle>
            <div className="h-2 w-2 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unusedDevices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Battery</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.filter((d) => (d.batteryLevel || 0) < 30).length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="used" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="used">Used Devices ({usedDevices.length})</TabsTrigger>
          <TabsTrigger value="unused">Unused Devices ({unusedDevices.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="used" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Used Device Inventory</CardTitle>
                  <CardDescription>Devices currently assigned to clients</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search devices..."
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
                    <TableHead>Device</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterDevices(usedDevices).map((device) => (
                    <TableRow key={device._id}>
                      <TableCell>
                        <div className="font-medium">{device.serialNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{device.customerName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {device.location || "Not set"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={device.batteryLevel || 0} className="w-16 h-2" />
                          <span className="text-sm">{device.batteryLevel || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(device.status)}>{device.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : "Never"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(device)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unused" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Unused Device Inventory</CardTitle>
                  <CardDescription>Available devices ready for assignment</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search devices..."
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
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Battery</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterDevices(unusedDevices).map((device) => (
                    <TableRow key={device._id}>
                      <TableCell>
                        <div className="font-medium">{device.serialNumber}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(device.status)}>{device.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={device.batteryLevel || 0} className="w-16 h-2" />
                          <span className="text-sm">{device.batteryLevel || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(device.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDeviceForAssignment(device)
                            setIsAssignDialogOpen(true)
                          }}
                        >
                          Assign to Client
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog
        open={isAssignDialogOpen}
        onOpenChange={(open) => {
          setIsAssignDialogOpen(open)
          if (!open) resetAssignmentForm()
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Device to Client</DialogTitle>
            <DialogDescription>
              Configure device assignment for {selectedDeviceForAssignment?.serialNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Select Client *</Label>
              <Select
                value={selectedCustomerId}
                onValueChange={(value) => {
                  setSelectedCustomerId(value)
                  if (formErrors.customer) setFormErrors({ ...formErrors, customer: "" })
                }}
              >
                <SelectTrigger className={formErrors.customer ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.name} - {customer.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.customer && <p className="text-sm text-red-500">{formErrors.customer}</p>}
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

              {/* Add Contact Form */}
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

              {/* Contact List */}
              {notificationList.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Contacts ({notificationList.length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notificationList.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-3 rounded border">
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
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignDevice}>Assign Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) resetEditForm()
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>
              Modify location and contact information for {selectedDeviceForDetails?.serialNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editLocation">Device Location</Label>
              <Input
                id="editLocation"
                value={editDeviceLocation}
                onChange={(e) => setEditDeviceLocation(e.target.value)}
                placeholder="e.g., North Boundary - Sector A"
                required
              />
            </div>

            <div className="grid gap-4">
              <Label>Notification Contacts</Label>

              {/* Add Contact Form */}
              <div className="grid gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editContactName">Contact Name</Label>
                    <Input
                      id="editContactName"
                      placeholder="Enter contact name"
                      value={editNewContact.name}
                      onChange={(e) => {
                        setEditNewContact({ ...editNewContact, name: e.target.value })
                        if (editContactErrors.name) setEditContactErrors({ ...editContactErrors, name: "" })
                      }}
                      className={editContactErrors.name ? "border-red-500" : ""}
                    />
                    {editContactErrors.name && <p className="text-sm text-red-500">{editContactErrors.name}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="editContactPhone">Phone Number</Label>
                    <Input
                      id="editContactPhone"
                      placeholder="0712345678"
                      value={editNewContact.phoneNumber}
                      onChange={(e) => {
                        setEditNewContact({ ...editNewContact, phoneNumber: e.target.value })
                        if (editContactErrors.phoneNumber)
                          setEditContactErrors({ ...editContactErrors, phoneNumber: "" })
                      }}
                      className={editContactErrors.phoneNumber ? "border-red-500" : ""}
                    />
                    {editContactErrors.phoneNumber && (
                      <p className="text-sm text-red-500">{editContactErrors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleEditAddContact}
                  className="w-full md:w-auto"
                  disabled={!editNewContact.name.trim() && !editNewContact.phoneNumber.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </div>

              {/* Contact List */}
              {editNotificationList.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Contacts ({editNotificationList.length})</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {editNotificationList.map((contact, index) => (
                      <div key={index} className="flex items-center justify-between bg-background p-3 rounded border">
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
                          onClick={() => handleEditRemoveContact(index)}
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditDevice}
              disabled={!editDeviceLocation.trim() || editNotificationList.length === 0}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Device Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Device Details</DialogTitle>
            <DialogDescription>Detailed information for {selectedDeviceForDetails?.serialNumber}</DialogDescription>
          </DialogHeader>
          {selectedDeviceForDetails && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Serial Number</Label>
                  <p className="text-sm text-muted-foreground">{selectedDeviceForDetails.serialNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={getStatusColor(selectedDeviceForDetails.status)} className="mt-1">
                    {selectedDeviceForDetails.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedDeviceForDetails.customerName || "Unassigned"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">{selectedDeviceForDetails.location || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Battery Level</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedDeviceForDetails.batteryLevel || 0} className="w-20 h-2" />
                    <span className="text-sm">{selectedDeviceForDetails.batteryLevel || 0}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Seen</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedDeviceForDetails.lastSeen
                      ? new Date(selectedDeviceForDetails.lastSeen).toLocaleString()
                      : "Never"}
                  </p>
                </div>
              </div>
              {selectedDeviceForDetails.listToBeNotified && selectedDeviceForDetails.listToBeNotified.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Notification Contacts</Label>
                  <div className="space-y-2 mt-2">
                    {selectedDeviceForDetails.listToBeNotified.map((contact, index) => (
                      <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{contact.name}</span>
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{contact.phoneNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <div>
              {selectedDeviceForDetails?.isUsed && (
                <Button variant="outline" onClick={handleEditClick} className="h-10">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Details
                </Button>
              )}
            </div>
            <Button onClick={() => setIsDetailsDialogOpen(false)} className="h-10">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
