
import React, { useState, useEffect } from "react";
import { User, Appointment, Business } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Mail, Phone, CheckCircle2, XCircle, AlertCircle, Bot } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [businesses, setBusinesses] = useState({});
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      await loadAppointments(currentUser);
    } catch (e) {
      setUser(null);
      // Log error or show a user-friendly message
      console.error("Failed to load user or appointments:", e);
    }
    setIsLoading(false);
  };
  
  const loadAppointments = async (currentUser) => {
    if (!currentUser) return;
    
    // Fetch businesses owned by the current user
    const businessData = await Business.filter({ owner_email: currentUser.email });
    const businessMap = {};
    businessData.forEach(b => {
      businessMap[b.id] = b;
    });
    setBusinesses(businessMap);

    if (businessData.length > 0) {
      const businessIds = businessData.map(b => b.id);
      // Assuming SDK supports $in operator for filtering multiple business IDs
      const appointmentData = await Appointment.filter({ business_id: { $in: businessIds } }, "-created_date");
      setAppointments(appointmentData);
    } else {
      setAppointments([]);
    }
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
  
  const stats = appointments.length > 0 ? {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    widgetBookings: appointments.filter(a => a.widget_session_id).length
  } : { total: 0, pending: 0, confirmed: 0, widgetBookings: 0 };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <p className="text-slate-600 text-lg">Loading appointments...</p>
      </div>
    );
  }

  if (!user) {
    return (
       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="p-12">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Welcome Business Owner!</h3>
              <p className="text-slate-500 mb-6">Please log in to view your appointments.</p>
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
          </div>
          <p className="text-slate-600">Manage appointments booked through your AI widget</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-slate-600">{stats.pending}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">AI Bookings</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.widgetBookings}</p>
                </div>
                <Bot className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg font-medium">
              Pending ({filterAppointments("pending").length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="rounded-lg font-medium">
              Confirmed ({filterAppointments("confirmed").length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg font-medium">
              Upcoming ({filterAppointments("upcoming").length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg font-medium">
              Past ({filterAppointments("past").length})
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="rounded-lg font-medium">
              Cancelled ({filterAppointments("cancelled").length})
            </TabsTrigger>
          </TabsList>

          {["pending", "confirmed", "upcoming", "past", "cancelled"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue}>
              <AnimatePresence>
                <div className="space-y-4">
                  {filterAppointments(tabValue).length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                          No {tabValue} appointments
                        </h3>
                        <p className="text-slate-500">
                          {tabValue === "pending"
                            ? "New appointment requests will appear here"
                            : `No ${tabValue} appointments found`}
                        </p>
                      </CardContent>
                    </Card>
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
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-semibold text-slate-900">
                                      {appointment.customer_name}
                                    </h3>
                                    {appointment.widget_session_id && (
                                      <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                                        <Bot className="w-3 h-3 mr-1" />
                                        AI Booking
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-slate-600 font-medium">{appointment.service_name}</p>
                                  <p className="text-sm text-slate-500">{business?.name}</p>
                                </div>
                                <Badge className={getStatusColor(appointment.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(appointment.status)}
                                    {appointment.status}
                                  </div>
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {format(new Date(appointment.appointment_date), "EEEE, MMM d, yyyy")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{appointment.appointment_time}</span>
                                    {appointment.duration && (
                                      <span className="text-slate-400">({appointment.duration} min)</span>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{appointment.customer_email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone className="w-4 h-4" />
                                    <span>{appointment.customer_phone}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  {appointment.price && (
                                    <div className="text-lg font-semibold text-slate-900">
                                      ${appointment.price}
                                    </div>
                                  )}
                                  <div className="text-xs text-slate-500">
                                    Booked {format(new Date(appointment.created_date), "MMM d 'at' h:mm a")}
                                  </div>
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
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                    Confirm Appointment
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    Reschedule
                                  </Button>
                                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    Decline
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
