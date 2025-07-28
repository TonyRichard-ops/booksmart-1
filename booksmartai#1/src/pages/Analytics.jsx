
import React, { useState, useEffect } from "react";
import { User, Appointment, Business } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Calendar, Bot, Clock, DollarSign, Activity, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export default function Analytics() {
  const [appointments, setAppointments] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [timeRange, setTimeRange] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, [timeRange]); // Rerun when timeRange changes

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const businessData = await Business.filter({ owner_email: currentUser.email });
      setBusinesses(businessData);

      if (businessData.length > 0) {
        const businessIds = businessData.map(b => b.id);
        const appointmentData = await Appointment.filter({ business_id: { $in: businessIds } }, "-created_date");
        setAppointments(appointmentData);
      } else {
        setAppointments([]);
      }
    } catch(e) {
      setUser(null);
      setAppointments([]); // Clear appointments if user not found or error
      setBusinesses([]);
      console.error("Failed to load user or business data:", e);
    }
    setIsLoading(false);
  };

  const getFilteredData = () => {
    const days = parseInt(timeRange);
    const cutoffDate = subDays(new Date(), days);
    return appointments.filter(apt => new Date(apt.created_date) >= cutoffDate);
  };

  const generateChartData = () => {
    const filteredAppointments = getFilteredData();
    const days = parseInt(timeRange);
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.created_date);
        return aptDate >= dayStart && aptDate <= dayEnd;
      });

      data.push({
        date: format(date, 'MMM dd'),
        bookings: dayAppointments.length,
        aiBookings: dayAppointments.filter(apt => apt.widget_session_id).length,
        revenue: dayAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0)
      });
    }

    return data;
  };

  const getServiceData = () => {
    const filteredAppointments = getFilteredData();
    const serviceCount = {};
    
    filteredAppointments.forEach(apt => {
      serviceCount[apt.service_name] = (serviceCount[apt.service_name] || 0) + 1;
    });

    return Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  const getStats = () => {
    const filteredAppointments = getFilteredData();
    const previousPeriodAppointments = appointments.filter(apt => {
      const days = parseInt(timeRange);
      const cutoffDate = subDays(new Date(), days * 2);
      const endDate = subDays(new Date(), days);
      const aptDate = new Date(apt.created_date);
      return aptDate >= cutoffDate && aptDate < endDate;
    });

    const current = {
      total: filteredAppointments.length,
      ai: filteredAppointments.filter(apt => apt.widget_session_id).length,
      revenue: filteredAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0),
      avgBookingValue: filteredAppointments.length > 0 
        ? filteredAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0) / filteredAppointments.length 
        : 0,
      conversionRate: filteredAppointments.length > 0 
        ? (filteredAppointments.filter(apt => apt.status === 'confirmed').length / filteredAppointments.length) * 100 
        : 0
    };

    const previous = {
      total: previousPeriodAppointments.length,
      ai: previousPeriodAppointments.filter(apt => apt.widget_session_id).length,
      revenue: previousPeriodAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0)
    };

    return {
      current,
      previous,
      growth: {
        total: previous.total > 0 ? ((current.total - previous.total) / previous.total) * 100 : 0,
        ai: previous.ai > 0 ? ((current.ai - previous.ai) / previous.ai) * 100 : 0,
        revenue: previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0
      }
    };
  };

  const chartData = !isLoading && user ? generateChartData() : [];
  const serviceData = !isLoading && user ? getServiceData() : [];
  const stats = !isLoading && user ? getStats() : { current: { total: 0, ai: 0, revenue: 0, avgBookingValue: 0, conversionRate: 0 }, previous: {}, growth: {} };

  const COLORS = ['#225740', '#348255', '#6b7280', '#64748b', '#9ca3af', '#d1d5db'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg" />
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-lg" />
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
              <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Welcome Business Owner!</h3>
              <p className="text-slate-500 mb-6">Please log in to view your analytics.</p>
              <Button onClick={() => User.login()} className="bg-indigo-500 hover:bg-indigo-600">
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
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
              </div>
              <p className="text-slate-600">Track your booking widget performance</p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {appointments.length === 0 && (
           <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Not Enough Data</h3>
              <p className="text-slate-500">
                Once you start getting appointments, your analytics will appear here.
              </p>
            </CardContent>
          </Card>
        )}

        {appointments.length > 0 && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Total Bookings</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.current.total}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stats.growth.total >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          stats.growth.total >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(stats.growth.total).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">AI Bookings</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.current.ai}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stats.growth.ai >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          stats.growth.ai >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(stats.growth.ai).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Bot className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Revenue</p>
                      <p className="text-3xl font-bold text-green-600">${stats.current.revenue.toFixed(0)}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {stats.growth.revenue >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          stats.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {Math.abs(stats.growth.revenue).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Conversion Rate</p>
                      <p className="text-3xl font-bold text-indigo-600">{stats.current.conversionRate.toFixed(1)}%</p>
                      <p className="text-sm text-slate-500 mt-1">Booking to confirmed</p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="bookings" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          name="Total Bookings"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="aiBookings" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          name="AI Bookings"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Breakdown */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Average Booking Value</p>
                        <p className="text-sm text-slate-500">Per appointment</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">${stats.current.avgBookingValue.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">AI Booking Rate</p>
                        <p className="text-sm text-slate-500">Widget vs manual</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.current.total > 0 ? ((stats.current.ai / stats.current.total) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">Success Rate</p>
                        <p className="text-sm text-slate-500">Confirmed bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{stats.current.conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
