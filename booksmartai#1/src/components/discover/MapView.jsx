import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

export default function MapView({ businesses }) {
  return (
    <div className="space-y-6">
      <Card className="h-96">
        <CardContent className="p-6 h-full flex items-center justify-center">
          <div className="text-center">
            <Navigation className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Map View Coming Soon</h3>
            <p className="text-slate-500">Interactive map with business locations will be available here</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Nearby Businesses</h3>
        {businesses.map((business) => (
          <Card key={business.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{business.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{business.category.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-500">0.5 mi away</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}