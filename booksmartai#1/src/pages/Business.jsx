
import React, { useState, useEffect } from "react";
import { Business as BusinessEntity, Appointment } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, DollarSign, Users, Calendar, TrendingUp, Star } from "lucide-react";
import BusinessDashboard from "../components/business/BusinessDashboard";
import SubscriptionPlans from "../components/business/SubscriptionPlans";
import AppointmentManagement from "../components/business/AppointmentManagement";

export default function Business() {
  const [businesses, setBusinesses] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const businessData = await BusinessEntity.list();
    const appointmentData = await Appointment.list("-created_date");
    setBusinesses(businessData);
    setAppointments(appointmentData);
    setIsLoading(false);
  };

  const stats = {
    totalBusinesses: businesses.length,
    totalAppointments: appointments.length,
    totalRevenue: appointments.reduce((sum, apt) => sum + (apt.price || 0), 0),
    activeSubscriptions: businesses.filter(b => b.subscription_status === "active").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Business Portal</h1>
          <p className="text-slate-600">Manage your business listings and subscriptions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Businesses</p>
                  <p className="text-3xl font-bold">{stats.totalBusinesses}</p>
                </div>
                <Building className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold">{stats.totalAppointments}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Revenue</p>
                  <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-slate-600 to-slate-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-100 text-sm font-medium">Active Plans</p>
                  <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-slate-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="rounded-lg font-medium">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg font-medium">
              Appointments
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg font-medium">
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <BusinessDashboard businesses={businesses} appointments={appointments} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentManagement appointments={appointments} businesses={businesses} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionPlans businesses={businesses} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
