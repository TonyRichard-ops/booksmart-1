import React, { useState, useEffect } from "react";
import { User, BusinessOwnerRequest, Business } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Shield, Users, Building } from "lucide-react";
import { format } from "date-fns";

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Only allow admin users to access this panel
      if (currentUser.role !== 'admin') {
        throw new Error('Unauthorized');
      }
      
      const requestData = await BusinessOwnerRequest.list("-created_date");
      setRequests(requestData);
    } catch (e) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const approveRequest = async (request) => {
    setProcessingId(request.id);
    try {
      // Create the business
      const business = await Business.create({
        name: request.business_name,
        category: request.business_category,
        description: request.description,
        address: request.business_address,
        phone: request.business_phone,
        email: request.owner_email,
        website: request.website,
        owner_email: request.owner_email,
        subscription_status: 'trial'
      });

      // Update the request status
      await BusinessOwnerRequest.update(request.id, {
        status: 'approved',
        approved_by: user.email,
        approved_at: new Date().toISOString()
      });

      // Send approval email
      await SendEmail({
        to: request.owner_email,
        subject: "BookBot Application Approved!",
        body: `
Hi ${request.owner_name},

Great news! Your BookBot application for "${request.business_name}" has been approved!

You can now log in to your business dashboard at: [Your Website URL]

Getting Started:
1. Log in with your Google account (${request.owner_email})
2. Set up your business hours and services
3. Customize your booking widget
4. Get your embed code and add it to your website
5. Start accepting bookings!

If you need any help getting started, don't hesitate to reach out to our support team.

Welcome to BookBot!

Best regards,
The BookBot Team
        `
      });

      await loadData();
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Error approving request. Please try again.");
    }
    setProcessingId(null);
  };

  const rejectRequest = async (request) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setProcessingId(request.id);
    try {
      // Update the request status
      await BusinessOwnerRequest.update(request.id, {
        status: 'rejected',
        rejection_reason: rejectionReason,
        approved_by: user.email
      });

      // Send rejection email
      await SendEmail({
        to: request.owner_email,
        subject: "BookBot Application Update",
        body: `
Hi ${request.owner_name},

Thank you for your interest in BookBot.

Unfortunately, we are unable to approve your application for "${request.business_name}" at this time.

Reason: ${rejectionReason}

If you believe this was an error or would like to reapply with additional information, please feel free to contact us.

Best regards,
The BookBot Team
        `
      });

      setRejectionReason("");
      await loadData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Error rejecting request. Please try again.");
    }
    setProcessingId(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-slate-100 text-slate-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading admin panel...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Access Denied</h3>
            <p className="text-slate-500">This area is restricted to administrators only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          </div>
          <p className="text-slate-600">Manage business owner applications and approvals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Pending Applications</p>
                  <p className="text-3xl font-bold text-slate-600">{pendingRequests.length}</p>
                </div>
                <Clock className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Approved Businesses</p>
                  <p className="text-3xl font-bold text-green-600">{approvedRequests.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Rejected Applications</p>
                  <p className="text-3xl font-bold text-red-600">{rejectedRequests.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected'].map((status) => (
            <TabsContent key={status} value={status}>
              <div className="grid gap-6">
                {(status === 'pending' ? pendingRequests : 
                  status === 'approved' ? approvedRequests : rejectedRequests).map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{request.business_name}</h3>
                          <p className="text-slate-600">{request.business_category.replace(/_/g, ' ')}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-4">
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Owner:</strong> {request.owner_name}</p>
                          <p className="text-sm"><strong>Email:</strong> {request.owner_email}</p>
                          <p className="text-sm"><strong>Phone:</strong> {request.owner_phone}</p>
                          <p className="text-sm"><strong>Applied:</strong> {format(new Date(request.created_date), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Address:</strong> {request.business_address}</p>
                          <p className="text-sm"><strong>Business Phone:</strong> {request.business_phone}</p>
                          {request.website && (
                            <p className="text-sm"><strong>Website:</strong> {request.website}</p>
                          )}
                        </div>
                      </div>

                      {request.description && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600">
                            <strong>Description:</strong> {request.description}
                          </p>
                        </div>
                      )}

                      {request.status === 'rejected' && request.rejection_reason && (
                        <div className="mb-4 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>Rejection Reason:</strong> {request.rejection_reason}
                          </p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Rejection Reason (if rejecting):</label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Provide a reason if rejecting this application..."
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => approveRequest(request)}
                              disabled={processingId === request.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {processingId === request.id ? "Processing..." : "Approve"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => rejectRequest(request)}
                              disabled={processingId === request.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {(status === 'pending' ? pendingRequests : 
                  status === 'approved' ? approvedRequests : rejectedRequests).length === 0 && (
                  <div className="text-center py-16">
                    <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No {status} applications</h3>
                    <p className="text-slate-500">
                      {status === 'pending' ? 'New applications will appear here' : `No ${status} applications found`}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}