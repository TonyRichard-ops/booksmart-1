import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Phone, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import BookingConfirmation from "../chat/BookingConfirmation";

export default function BusinessCard({ business }) {
  const [showBooking, setShowBooking] = useState(false);

  const handleBookingComplete = (bookingData) => {
    setShowBooking(false);
    // Could show a success message here
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden group">
          <div className="relative h-48 overflow-hidden">
            <img
              src={business.image_url || `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop`}
              alt={business.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-slate-800 shadow-sm">
                {business.category.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium">{business.rating}</span>
                <span className="text-xs text-slate-500">({business.review_count})</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{business.name}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{business.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{business.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{business.phone}</span>
                </div>
                {business.hours?.monday && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>Today: {business.hours.monday}</span>
                  </div>
                )}
              </div>

              {business.services && business.services.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Services</p>
                  <div className="flex flex-wrap gap-1">
                    {business.services.slice(0, 3).map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service.name}
                      </Badge>
                    ))}
                    {business.services.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{business.services.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button 
                  onClick={() => setShowBooking(true)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showBooking && (
        <BookingConfirmation
          business={business}
          onClose={() => setShowBooking(false)}
          onComplete={handleBookingComplete}
        />
      )}
    </>
  );
}