
import React, { useState } from "react";
import { Appointment } from "@/api/entities";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Phone, Mail, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function BookingConfirmation({ business, onClose, onComplete }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    service_name: "",
    appointment_date: "",
    appointment_time: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedService = business.services?.find(s => s.name === formData.service_name);
      
      await Appointment.create({
        business_id: business.id,
        ...formData,
        duration: selectedService?.duration || 60,
        price: selectedService?.price || 0,
        status: "pending"
      });

      onComplete({
        ...formData,
        business_name: business.name
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Book Appointment at {business.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="space-y-2">
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
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customer_phone">Phone Number *</Label>
              <Input
                id="customer_phone"
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="service_name">Service *</Label>
              <Select 
                value={formData.service_name} 
                onValueChange={(value) => setFormData({...formData, service_name: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {business.services?.map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name} - ${service.price} ({service.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment_date">Preferred Date *</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                  min={format(new Date(), "yyyy-MM-dd")}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="appointment_time">Preferred Time *</Label>
                <Input
                  id="appointment_time"
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any special requests or notes..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-slate-900 hover:bg-slate-800"
              >
                {isSubmitting ? "Booking..." : "Book Appointment"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
