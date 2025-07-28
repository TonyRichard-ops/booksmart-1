
import React, { useState } from "react";
import { User } from "@/api/entities";
import { Business } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Play, Sparkles, Shield } from "lucide-react";
import BookingWidget from "../components/widget/BookingWidget";
import WidgetCustomizer from "../components/demo/WidgetCustomizer";

export default function Demo() {
  const [deviceView, setDeviceView] = useState("desktop");
  const [widgetSettings, setWidgetSettings] = useState({
    primary_color: "#225740",
    accent_color: "#348255",
    widget_position: "bottom-right",
    greeting_message: "Hi! I can help you book an appointment. What service are you interested in?",
    business_logo: "",
    show_services: true,
    show_availability: true,
    collect_phone: true
  });
  const [showWidget, setShowWidget] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Only allow admins or business owners to access this page
      if (currentUser.role !== 'admin') {
        const userBusinesses = await Business.filter({ owner_email: currentUser.email });
        if (userBusinesses.length === 0) {
          setUser(null);
        }
      }
    } catch (e) {
      setUser(null);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
            <div className="grid gap-6">
              {Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-lg" />
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
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Access Restricted</h3>
              <p className="text-slate-500 mb-6">
                This demo is for approved business owners only.
              </p>
              <div className="space-y-3">
                <Button onClick={() => window.location.href = '/BusinessSignup'} className="w-full bg-green-600 hover:bg-green-700">
                  Apply as Business Owner
                </Button>
                <Button onClick={() => User.logout()} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const demoBusinessData = {
    id: "demo-business",
    name: "Bella Vista Salon",
    category: "salon",
    description: "Premium hair salon offering cuts, colors, and styling services",
    phone: "(555) 123-4567",
    email: "info@bellavistasalon.com",
    services: [
      { name: "Women's Haircut", duration: 60, price: 75, description: "Professional cut and styling" },
      { name: "Hair Color", duration: 120, price: 150, description: "Full color treatment" },
      { name: "Highlights", duration: 180, price: 200, description: "Partial or full highlights" },
      { name: "Blowout", duration: 45, price: 50, description: "Wash and professional styling" }
    ],
    hours: {
      monday: "9:00 AM - 7:00 PM",
      tuesday: "9:00 AM - 7:00 PM",
      wednesday: "9:00 AM - 7:00 PM",
      thursday: "9:00 AM - 8:00 PM",
      friday: "9:00 AM - 8:00 PM",
      saturday: "8:00 AM - 6:00 PM",
      sunday: "10:00 AM - 5:00 PM"
    },
    widget_settings: widgetSettings
  };

  const getDeviceClass = () => {
    switch (deviceView) {
      case "mobile":
        return "w-80 h-[600px]";
      case "tablet":
        return "w-96 h-[700px]";
      default:
        return "w-full h-[800px]";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Widget Demo</h1>
          </div>
          <p className="text-slate-600">See how the AI booking widget works on your website</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Demo Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Live Preview
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={deviceView === "desktop" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDeviceView("desktop")}
                    >
                      <Monitor className="w-4 h-4 mr-1" />
                      Desktop
                    </Button>
                    <Button
                      variant={deviceView === "tablet" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDeviceView("tablet")}
                    >
                      <Tablet className="w-4 h-4 mr-1" />
                      Tablet
                    </Button>
                    <Button
                      variant={deviceView === "mobile" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDeviceView("mobile")}
                    >
                      <Smartphone className="w-4 h-4 mr-1" />
                      Mobile
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-center">
                  <div className={`${getDeviceClass()} border-2 border-slate-200 rounded-lg overflow-hidden bg-white relative shadow-lg`}>
                    {/* Mock Website Content */}
                    <div className="h-full bg-gradient-to-b from-blue-50 to-white p-8 flex flex-col items-center justify-center">
                      <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Bella Vista Salon</h2>
                        <p className="text-slate-600">Premium hair care services in the heart of downtown</p>
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 max-w-md w-full">
                        <h3 className="font-semibold mb-4">Our Services</h3>
                        <div className="space-y-2">
                          {demoBusinessData.services.slice(0, 3).map((service, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span>{service.name}</span>
                              <span className="font-medium">${service.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowWidget(true)}
                        className="text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: widgetSettings.primary_color }}
                      >
                        <Play className="w-4 h-4" />
                        Try Booking Widget
                      </Button>

                      <Badge className="mt-4 bg-green-100 text-green-800">
                        This is a demo website - the widget will appear here
                      </Badge>
                    </div>

                    {/* Widget Overlay */}
                    {showWidget && (
                      <BookingWidget
                        business={demoBusinessData}
                        onClose={() => setShowWidget(false)}
                        settings={widgetSettings}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integration Guide */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-100 overflow-x-auto">
                  <div className="text-green-400 mb-2">{'<!-- Add this script to your website -->'}</div>
                  <div className="text-blue-300">{'<script src="https://bookbot.ai/widget.js"></script>'}</div>
                  <div className="text-yellow-300 mt-2">{'<script>'}</div>
                  <div className="ml-4 text-white">
                    {'BookBot.init({\n'}
                    {'  apiKey: "your-api-key",\n'}
                    {'  position: "bottom-right",\n'}
                    {'  primaryColor: "#3B82F6"\n'}
                    {'});'}
                  </div>
                  <div className="text-yellow-300">{'</script>'}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Widget Customizer */}
          <div className="space-y-6">
            <WidgetCustomizer
              settings={widgetSettings}
              onSettingsChange={setWidgetSettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
