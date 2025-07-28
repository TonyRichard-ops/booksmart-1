
import React, { useState, useEffect } from "react";
import { Appointment, Business } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Bookings() {
  const [appointments, setAppointments] = useState([]);
  const [businesses, setBusinesses] = useState({});
  const [activeTab, setActiveTab] = useState("upcoming");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setIsLoading(true);
    const appointmentData = await Appointment.list("-created_date");
    setAppointments(appointmentData);

    const businessIds = [...new Set(appointmentData.map(a => a.business_id))];
    const businessData = await Business.list();
    const businessMap = {};
    businessData.forEach(b => {
      businessMap[b.id] = b;
    });
    setBusinesses(businessMap);
    setIsLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const filterAppointments = (status) => {
    const now = new Date();
    if (status === "upcoming") {
      return appointments.filter(a => 
        (a.status === "confirmed" || a.status === "pending") && 
        new Date(a.appointment_date) >= now
      );
    } else if (status === "past") {
      return appointments.filter(a => 
        new Date(a.appointment_date) < now || a.status === "completed"
      );
    } else {
      return appointments.filter(a => a.status === status);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-600">Manage your appointments and booking history</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="upcoming" className="rounded-lg font-medium">
              Upcoming ({filterAppointments("upcoming").length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg font-medium">
              Past ({filterAppointments("past").length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg font-medium">
              Pending ({filterAppointments("pending").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-lg font-medium">
              Cancelled ({filterAppointments("cancelled").length})
            </TabsTrigger>
          </TabsList>

          {["upcoming", "past", "pending", "cancelled"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              <AnimatePresence>
                <div className="grid gap-6">
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="space-y-2">
                              <div className="h-5 bg-slate-200 rounded w-48" />
                              <div className="h-4 bg-slate-200 rounded w-32" />
                            </div>
                            <div className="h-6 bg-slate-200 rounded-full w-20" />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-full" />
                              <div className="h-4 bg-slate-200 rounded w-3/4" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-full" />
                              <div className="h-4 bg-slate-200 rounded w-2/3" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filterAppointments(tabValue).length === 0 ? (
                    <div className="text-center py-16">
                      <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No {tabValue} appointments
                      </h3>
                      <p className="text-slate-500">
                        {tabValue === "upcoming" 
                          ? "Book your first appointment to get started" 
                          : `You don't have any ${tabValue} appointments`}
                      </p>
                    </div>
                  ) : (
                    filterAppointments(tabValue).map((appointment) => {
                      const business = businesses[appointment.business_id];
                      return (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                    {business?.name || "Business"}
                                  </h3>
                                  <p className="text-slate-600 font-medium">{appointment.service_name}</p>
                                </div>
                                <Badge className={getStatusColor(appointment.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(appointment.status)}
                                    {appointment.status}
                                  </div>
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {format(new Date(appointment.appointment_date), "EEEE, MMMM d, yyyy")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{appointment.appointment_time}</span>
                                    {appointment.duration && (
                                      <span className="text-slate-400">({appointment.duration} min)</span>
                                    )}
                                  </div>
                                  {business?.address && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <MapPin className="w-4 h-4" />
                                      <span>{business.address}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{appointment.customer_email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{appointment.customer_phone}</span>
                                  </div>
                                  {appointment.price && (
                                    <div className="text-sm font-semibold text-slate-900">
                                      ${appointment.price}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {appointment.notes && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                  <p className="text-sm text-slate-600">
                                    <strong>Notes:</strong> {appointment.notes}
                                  </p>
                                </div>
                              )}

                              {appointment.status === "pending" && (
                                <div className="mt-4 flex gap-3">
                                  <Button variant="outline" size="sm">
                                    Reschedule
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                    Cancel
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
