import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Mail, Phone, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function AppointmentManagement({ appointments, businesses, isLoading }) {
  const [activeTab, setActiveTab] = useState("pending");

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const filterAppointments = (status) => {
    if (status === "all") return appointments;
    return appointments.filter(apt => apt.status === status);
  };

  const businessMap = {};
  businesses.forEach(b => {
    businessMap[b.id] = b;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Management</h2>
          <p className="text-slate-600">Manage and track all your business appointments</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg font-medium">
            Pending ({filterAppointments("pending").length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="rounded-lg font-medium">
            Confirmed ({filterAppointments("confirmed").length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg font-medium">
            Completed ({filterAppointments("completed").length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-lg font-medium">
            Cancelled ({filterAppointments("cancelled").length})
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg font-medium">
            All ({appointments.length})
          </TabsTrigger>
        </TabsList>

        {["pending", "confirmed", "completed", "cancelled", "all"].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            <AnimatePresence>
              <div className="space-y-4">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
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
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filterAppointments(tabValue).length === 0 ? (
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
                    const business = businessMap[appointment.business_id];
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
                                  {appointment.customer_name}
                                </h3>
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
                                    {format(new Date(appointment.appointment_date), "MMM d, yyyy")}
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
                                  Booked {format(new Date(appointment.created_date), "MMM d")}
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
                                  Confirm
                                </Button>
                                <Button variant="outline" size="sm">
                                  Reschedule
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
  );
}