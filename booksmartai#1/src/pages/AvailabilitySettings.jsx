
import React, { useState, useEffect } from "react";
import { User, Business, BusinessHours, TimeSlot } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Plus, Minus, Save } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

export default function AvailabilitySettings() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessHours, setBusinessHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const businessData = await Business.filter({ owner_email: currentUser.email });
      setBusinesses(businessData);
      
      if (businessData.length > 0) {
        setSelectedBusiness(businessData[0]);
        await loadBusinessHours(businessData[0].id);
      }
    } catch(e) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const loadBusinessHours = async (businessId) => {
    const hours = await BusinessHours.filter({ business_id: businessId });
    
    // Create default hours if none exist
    if (hours.length === 0) {
      const defaultHours = daysOfWeek.map(day => ({
        business_id: businessId,
        day_of_week: day.key,
        is_open: day.key !== 'sunday',
        open_time: '09:00',
        close_time: '17:00',
        break_start: '12:00',
        break_end: '13:00'
      }));
      setBusinessHours(defaultHours);
    } else {
      setBusinessHours(hours);
    }
  };

  const updateBusinessHours = (dayKey, field, value) => {
    setBusinessHours(prev => prev.map(hour => 
      hour.day_of_week === dayKey 
        ? { ...hour, [field]: value }
        : hour
    ));
  };

  const saveBusinessHours = async () => {
    if (!selectedBusiness) return;
    
    setIsSaving(true);
    try {
      for (const hour of businessHours) {
        const existing = await BusinessHours.filter({
          business_id: selectedBusiness.id,
          day_of_week: hour.day_of_week
        });

        if (existing.length > 0) {
          await BusinessHours.update(existing[0].id, hour);
        } else {
          await BusinessHours.create(hour);
        }
      }
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-3 rounded-lg z-50';
      successDiv.textContent = 'Business hours saved successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
      
    } catch (error) {
      console.error('Error saving business hours:', error);
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="grid gap-6">
              {Array(7).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded-lg" />
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
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Welcome Business Owner!</h3>
              <p className="text-slate-500 mb-6">Please log in to manage your availability.</p>
              <Button onClick={() => User.login()} className="bg-green-600 hover:bg-green-700">
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Availability Settings</h1>
          </div>
          <p className="text-slate-600">Set your business hours and availability</p>
        </div>

        {businesses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Business Found</h3>
              <p className="text-slate-500 mb-6">Create your business profile in the Settings page first.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Business Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Business</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedBusiness?.id || ""} 
                  onValueChange={async (businessId) => {
                    const business = businesses.find(b => b.id === businessId);
                    setSelectedBusiness(business);
                    await loadBusinessHours(businessId);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Business Hours</CardTitle>
                <Button 
                  onClick={saveBusinessHours}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Hours'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day) => {
                  const dayHours = businessHours.find(h => h.day_of_week === day.key) || {
                    day_of_week: day.key,
                    is_open: true,
                    open_time: '09:00',
                    close_time: '17:00',
                    break_start: '',
                    break_end: ''
                  };

                  return (
                    <div key={day.key} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-base font-medium">{day.label}</Label>
                        <Switch
                          checked={dayHours.is_open}
                          onCheckedChange={(checked) => updateBusinessHours(day.key, 'is_open', checked)}
                        />
                      </div>

                      {dayHours.is_open && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm">Open Time</Label>
                            <Input
                              type="time"
                              value={dayHours.open_time || '09:00'}
                              onChange={(e) => updateBusinessHours(day.key, 'open_time', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Close Time</Label>
                            <Input
                              type="time"
                              value={dayHours.close_time || '17:00'}
                              onChange={(e) => updateBusinessHours(day.key, 'close_time', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Break Start (Optional)</Label>
                            <Input
                              type="time"
                              value={dayHours.break_start || ''}
                              onChange={(e) => updateBusinessHours(day.key, 'break_start', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Break End (Optional)</Label>
                            <Input
                              type="time"
                              value={dayHours.break_end || ''}
                              onChange={(e) => updateBusinessHours(day.key, 'break_end', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}

                      {!dayHours.is_open && (
                        <p className="text-sm text-slate-500 italic">Closed</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Set standard business hours (9-5, Mon-Fri)
                      const standardHours = daysOfWeek.map(day => ({
                        ...businessHours.find(h => h.day_of_week === day.key) || {},
                        business_id: selectedBusiness.id,
                        day_of_week: day.key,
                        is_open: !['saturday', 'sunday'].includes(day.key),
                        open_time: '09:00',
                        close_time: '17:00',
                        break_start: '',
                        break_end: ''
                      }));
                      setBusinessHours(standardHours);
                    }}
                  >
                    Standard Hours (9-5)
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Set retail hours (10-6, Mon-Sat)
                      const retailHours = daysOfWeek.map(day => ({
                        ...businessHours.find(h => h.day_of_week === day.key) || {},
                        business_id: selectedBusiness.id,
                        day_of_week: day.key,
                        is_open: day.key !== 'sunday',
                        open_time: '10:00',
                        close_time: '18:00',
                        break_start: '',
                        break_end: ''
                      }));
                      setBusinessHours(retailHours);
                    }}
                  >
                    Retail Hours (10-6)
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Set salon hours with lunch break
                      const salonHours = daysOfWeek.map(day => ({
                        ...businessHours.find(h => h.day_of_week === day.key) || {},
                        business_id: selectedBusiness.id,
                        day_of_week: day.key,
                        is_open: day.key !== 'sunday',
                        open_time: '09:00',
                        close_time: '19:00',
                        break_start: '12:00',
                        break_end: '13:00'
                      }));
                      setBusinessHours(salonHours);
                    }}
                  >
                    Salon Hours (9-7)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
