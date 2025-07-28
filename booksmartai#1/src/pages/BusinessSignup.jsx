
import React, { useState } from "react";
import { BusinessOwnerRequest } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Building2, Phone, Mail, MapPin, Globe } from "lucide-react";

export default function BusinessSignup() {
  const [formData, setFormData] = useState({
    business_name: "",
    business_category: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    business_address: "",
    business_phone: "",
    website: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create the business owner request
      await BusinessOwnerRequest.create(formData);

      // Send notification email to admins (can fail gracefully)
      try {
        await SendEmail({
          to: "admin@yourdomain.com", // Replace with your admin email
          subject: "New Business Owner Application",
          body: `
New business owner application received:

Business: ${formData.business_name}
Category: ${formData.business_category}
Owner: ${formData.owner_name}
Email: ${formData.owner_email}
Phone: ${formData.owner_phone}
Address: ${formData.business_address}

Please review and approve/reject this application in the admin panel.
          `
        });
      } catch (adminEmailError) {
        console.error("Failed to send admin notification email:", adminEmailError);
        // Do not re-throw, allow the rest of the process to continue
      }
      

      // Send confirmation email to applicant (can fail gracefully)
      try {
        await SendEmail({
          to: formData.owner_email,
          subject: "BookBot Application Received",
          body: `
Hi ${formData.owner_name},

Thank you for applying to join BookBot as a business owner!

We have received your application for "${formData.business_name}" and our team will review it within 1-2 business days.

You will receive an email confirmation once your application has been approved, along with instructions on how to access your business dashboard.

If you have any questions, please don't hesitate to contact us.

Best regards,
The BookBot Team
          `
        });
      } catch (applicantEmailError) {
        console.error("Failed to send applicant confirmation email:", applicantEmailError);
        // Do not re-throw, allow the rest of the process to continue
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("There was an error submitting your application. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Thank you for applying to join BookBot. We'll review your application and get back to you within 1-2 business days.
            </p>
            <p className="text-sm text-slate-500">
              You'll receive an email confirmation once your application is approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Join BookBot</h1>
          <p className="text-slate-600">Start accepting AI-powered bookings for your business</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Owner Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    required
                    placeholder="e.g., Bella Vista Salon"
                  />
                </div>
                <div>
                  <Label htmlFor="business_category">Business Category *</Label>
                  <Select
                    value={formData.business_category}
                    onValueChange={(value) => setFormData({...formData, business_category: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salon">Salon</SelectItem>
                      <SelectItem value="spa">Spa</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="dental">Dental</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="professional_services">Professional Services</SelectItem>
                      <SelectItem value="beauty">Beauty</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner_name">Your Full Name *</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                    required
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="owner_email">Your Email *</Label>
                  <Input
                    id="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner_phone">Your Phone Number *</Label>
                  <Input
                    id="owner_phone"
                    type="tel"
                    value={formData.owner_phone}
                    onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                    required
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="business_phone">Business Phone *</Label>
                  <Input
                    id="business_phone"
                    type="tel"
                    value={formData.business_phone}
                    onChange={(e) => setFormData({...formData, business_phone: e.target.value})}
                    required
                    placeholder="(555) 987-6543"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="business_address">Business Address *</Label>
                <Input
                  id="business_address"
                  value={formData.business_address}
                  onChange={(e) => setFormData({...formData, business_address: e.target.value})}
                  required
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div>
                <Label htmlFor="website">Business Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://yourbusiness.com"
                />
              </div>

              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell us about your business, services offered, etc."
                  rows={4}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Our team will review your application within 1-2 business days</li>
                  <li>• You'll receive an email with your account details once approved</li>
                  <li>• Set up your business hours and services</li>
                  <li>• Get your AI booking widget code to embed on your website</li>
                  <li>• Start accepting bookings automatically!</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
