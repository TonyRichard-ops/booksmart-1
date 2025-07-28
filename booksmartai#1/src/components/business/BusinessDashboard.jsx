import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Phone, Mail, Star, Users } from "lucide-react";
import { format } from "date-fns";

export default function BusinessDashboard({ businesses, appointments, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid gap-6">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No Business Listed</h3>
          <p className="text-slate-500 mb-6">Start by adding your first business to the platform</p>
          <Button className="bg-slate-900 hover:bg-slate-800">
            Add Your Business
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {businesses.map((business) => {
        const businessAppointments = appointments.filter(apt => apt.business_id === business.id);
        const pendingCount = businessAppointments.filter(apt => apt.status === "pending").length;
        const totalRevenue = businessAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);

        return (
          <Card key={business.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-slate-900">{business.name}</CardTitle>
                  <p className="text-slate-600 mt-1">{business.description}</p>
                </div>
                <Badge 
                  className={business.subscription_status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {business.subscription_status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{business.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span>{business.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Star className="w-4 h-4" />
                    <span>{business.rating}/5 ({business.review_count} reviews)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-3">Quick Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Bookings</span>
                        <span className="font-medium">{businessAppointments.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Pending</span>
                        <span className="font-medium text-yellow-600">{pendingCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Revenue</span>
                        <span className="font-medium text-green-600">${totalRevenue}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Plan</span>
                        <span className="font-medium">{business.subscription_plan}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="outline" size="sm">
                  Edit Business
                </Button>
                <Button variant="outline" size="sm">
                  View Bookings
                </Button>
                <Button variant="outline" size="sm">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}