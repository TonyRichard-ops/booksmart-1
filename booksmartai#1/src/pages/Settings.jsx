
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Business } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Palette, MessageSquare, Zap, Save, Plus, Minus, Building, Shield, CheckCircle } from "lucide-react";

export default function Settings() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [newBusinessName, setNewBusinessName] = useState("");
  const [newBusinessCategory, setNewBusinessCategory] = useState("salon");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Only allow admins or business owners to access this page
      if (currentUser.role !== 'admin') {
        // Check if user has any approved businesses
        const userBusinesses = await Business.filter({ owner_email: currentUser.email });
        if (userBusinesses.length === 0) {
          setUser(null); // Block access if not admin and no businesses
          setIsLoading(false);
          return;
        }
      }
      
      await loadBusinesses(currentUser);
    } catch (e) {
      // User not logged in or error fetching user, or not authorized based on role/business check
      console.error("Failed to load user or unauthorized:", e);
      setUser(null);
      setBusinesses([]);
      setSelectedBusiness(null);
    }
    setIsLoading(false);
  };
  
  const loadBusinesses = async (currentUser) => {
    if (!currentUser) {
      setBusinesses([]);
      setSelectedBusiness(null);
      return;
    }
    
    let data;
    if (currentUser.role === 'admin') {
      // Admins can see all businesses
      data = await Business.list();
    } else {
      // Regular users can only see their own businesses
      data = await Business.filter({ owner_email: currentUser.email });
    }
    
    setBusinesses(data);
    if (data.length > 0) {
      setSelectedBusiness(data[0]);
    } else {
      setSelectedBusiness(null);
    }
  };

  const handleCreateBusiness = async () => {
    if (!newBusinessName.trim() || !user) return;
    setIsLoading(true);
    try {
      await Business.create({
        name: newBusinessName,
        category: newBusinessCategory,
        owner_email: user.email,
        email: user.email
      });
      await loadBusinesses(user);
      setNewBusinessName("");
      setNewBusinessCategory("salon");
    } catch (error) {
      console.error("Error creating business:", error);
      // Handle error (e.g., show a toast message)
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const updateBusiness = async (updates) => {
    if (!selectedBusiness) return;
    
    setIsSaving(true);
    const updatedBusiness = { ...selectedBusiness, ...updates };
    await Business.update(selectedBusiness.id, updatedBusiness);
    setSelectedBusiness(updatedBusiness);
    setIsSaving(false);
    showSuccessMessage();
  };

  const updateWidgetSettings = async (updates) => {
    if (!selectedBusiness) return;
    setIsSaving(true);
    const updatedSettings = {
      ...selectedBusiness.widget_settings,
      ...updates
    };
    const updated = { ...selectedBusiness, widget_settings: updatedSettings };
    await Business.update(selectedBusiness.id, { widget_settings: updatedSettings });
    setSelectedBusiness(updated);
    setIsSaving(false);
    showSuccessMessage();
  };

  const addService = async () => {
    const newServices = [
      ...(selectedBusiness.services || []),
      { name: "", duration: 60, price: 0, description: "" }
    ];
    await updateBusiness({ services: newServices });
  };

  const updateService = async (index, field, value) => {
    const newServices = [...selectedBusiness.services];
    newServices[index] = { ...newServices[index], [field]: value };
    await updateBusiness({ services: newServices });
  };

  const removeService = async (index) => {
    const newServices = selectedBusiness.services.filter((_, i) => i !== index);
    await updateBusiness({ services: newServices });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="grid gap-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="p-12">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Access Restricted</h3>
              <p className="text-slate-500 mb-6">
                This area is for approved business owners only. 
                <br />
                <br />
                If you're a business owner, please apply through our business signup process.
              </p>
              <div className="space-y-3">
                <Button onClick={() => window.location.href = '/BusinessSignup'} className="w-full bg-green-600 hover:bg-green-700">
                  Apply as Business Owner
                </Button>
                <Button onClick={() => User.logout()} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Your Business</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-slate-600">Let's get your business set up on the platform.</p>
              <div>
                <Label htmlFor="new-business-name">Business Name</Label>
                <Input
                  id="new-business-name"
                  value={newBusinessName}
                  onChange={(e) => setNewBusinessName(e.target.value)}
                  placeholder="e.g., Bella Vista Salon"
                />
              </div>
              <div>
                <Label htmlFor="new-business-category">Category</Label>
                <Select
                  value={newBusinessCategory}
                  onValueChange={setNewBusinessCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salon">Salon</SelectItem>
                    <SelectItem value="spa">Spa</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="dental">Dental</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateBusiness} className="w-full bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2"/>
                Create Business
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {showSuccess && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Settings Saved!</span>
        </div>
      )}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            </div>
            <p className="text-slate-600">Manage your business profile and widget settings</p>
          </div>
          <Button onClick={() => updateBusiness(selectedBusiness)} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>

        <div className="space-y-8">
          {/* Business Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedBusiness?.id === business.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedBusiness(business)}
                >
                  <h3 className="font-semibold text-slate-900">{business.name}</h3>
                  <p className="text-sm text-slate-500">{business.category.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Removed original "Save Changes" button as it's now global */}
              <Button className="w-full" variant="outline">
                Preview Widget
              </Button>
              <Button className="w-full" variant="outline">
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
          
          {/* Settings Content */}
          <Tabs defaultValue="business" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="widget">Widget</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        value={selectedBusiness.name}
                        onChange={(e) => updateBusiness({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-category">Category</Label>
                      <Select
                        value={selectedBusiness.category}
                        onValueChange={(value) => updateBusiness({ category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="salon">Salon</SelectItem>
                          <SelectItem value="spa">Spa</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="dental">Dental</SelectItem>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="automotive">Automotive</SelectItem>
                          <SelectItem value="beauty">Beauty</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="business-description">Description</Label>
                    <Textarea
                      id="business-description"
                      value={selectedBusiness.description || ""}
                      onChange={(e) => updateBusiness({ description: e.target.value })}
                      placeholder="Describe your business..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-phone">Phone</Label>
                      <Input
                        id="business-phone"
                        value={selectedBusiness.phone}
                        onChange={(e) => updateBusiness({ phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="business-email">Email</Label>
                      <Input
                        id="business-email"
                        type="email"
                        value={selectedBusiness.email}
                        onChange={(e) => updateBusiness({ email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="business-address">Address</Label>
                    <Input
                        id="business-address"
                        value={selectedBusiness.address || ""}
                        onChange={(e) => updateBusiness({ address: e.target.value })}
                        placeholder="Full business address"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="widget" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Widget Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Input
                          type="color"
                          value={selectedBusiness.widget_settings?.primary_color || '#225740'}
                          onChange={(e) => updateWidgetSettings({ primary_color: e.target.value })}
                          className="p-0 border-none w-12 h-12 bg-transparent cursor-pointer"
                        />
                        <Input
                          value={selectedBusiness.widget_settings?.primary_color || '#225740'}
                          onChange={(e) => updateWidgetSettings({ primary_color: e.target.value })}
                          className="font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Accent Color</Label>
                      <div className="flex items-center gap-3 mt-2">
                           <Input
                            type="color"
                            value={selectedBusiness.widget_settings?.accent_color || '#348255'}
                            onChange={(e) => updateWidgetSettings({ accent_color: e.target.value })}
                            className="p-0 border-none w-12 h-12 bg-transparent cursor-pointer"
                          />
                          <Input
                            value={selectedBusiness.widget_settings?.accent_color || '#348255'}
                            onChange={(e) => updateWidgetSettings({ accent_color: e.target.value })}
                            className="font-mono"
                          />
                        </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="widget-position">Widget Position</Label>
                    <Select
                      value={selectedBusiness.widget_settings?.widget_position || 'bottom-right'}
                      onValueChange={(value) => updateWidgetSettings({ widget_position: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="greeting-message">Greeting Message</Label>
                    <Textarea
                      id="greeting-message"
                      value={selectedBusiness.widget_settings?.greeting_message || ""}
                      onChange={(e) => updateWidgetSettings({ greeting_message: e.target.value })}
                      placeholder="Hi! I can help you book an appointment..."
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Widget Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Services List</p>
                      <p className="text-sm text-slate-500">Display available services in the widget</p>
                    </div>
                    <Switch
                      checked={selectedBusiness.widget_settings?.show_services !== false}
                      onCheckedChange={(value) => updateWidgetSettings({ show_services: value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Availability</p>
                      <p className="text-sm text-slate-500">Display real-time availability</p>
                    </div>
                    <Switch
                      checked={selectedBusiness.widget_settings?.show_availability !== false}
                      onCheckedChange={(value) => updateWidgetSettings({ show_availability: value })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Collect Phone Number</p>
                      <p className="text-sm text-slate-500">Require phone number for bookings</p>
                    </div>
                    <Switch
                      checked={selectedBusiness.widget_settings?.collect_phone !== false}
                      onCheckedChange={(value) => updateWidgetSettings({ collect_phone: value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Services</CardTitle>
                  <Button onClick={addService} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Service
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedBusiness.services?.map((service, index) => (
                    <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Service {index + 1}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeService(index)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Service Name</Label>
                          <Input
                            value={service.name}
                            onChange={(e) => updateService(index, 'name', e.target.value)}
                            placeholder="e.g., Haircut"
                          />
                        </div>
                        <div>
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={service.duration}
                            onChange={(e) => updateService(index, 'duration', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            value={service.price}
                            onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={service.description || ""}
                          onChange={(e) => updateService(index, 'description', e.target.value)}
                          placeholder="Service description..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {(!selectedBusiness.services || selectedBusiness.services.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No services added yet</p>
                      <Button onClick={addService} className="mt-2">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Your First Service
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-slate-500">Receive emails for new bookings</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-slate-500">Receive text messages for urgent updates</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Browser Notifications</p>
                      <p className="text-sm text-slate-500">Show desktop notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="pt-4 border-t">
                    <Label htmlFor="notification-email">Notification Email</Label>
                    <Input
                      id="notification-email"
                      type="email"
                      value={selectedBusiness.owner_email || ""}
                      onChange={(e) => updateBusiness({ owner_email: e.target.value })}
                      placeholder="admin@yourbusiness.com"
                      className="mt-2"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Where should we send booking notifications?
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
