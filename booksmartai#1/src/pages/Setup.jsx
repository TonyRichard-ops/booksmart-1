
import React, { useState, useEffect } from "react";
import { Business } from "@/api/entities";
import { User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Settings, Palette, MessageSquare, CheckCircle, ExternalLink, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Setup() {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      let data = [];
      if (currentUser.role === 'admin') {
        data = await Business.list();
      } else {
        // Non-admin users can only see businesses they own
        const userBusinesses = await Business.filter({ owner_email: currentUser.email });
        if (userBusinesses.length === 0) {
          // If a non-admin user has no associated businesses, they don't have access
          setUser(null); 
          setIsLoading(false);
          return;
        }
        data = userBusinesses;
      }
      
      setBusinesses(data);
      if (data.length > 0) {
        setSelectedBusiness(data[0]);
        // Note: The generated API key is client-side. For persistence, it should be saved to the business object via an API call.
        // This current setup assumes the key is already stored, or will be manually saved by the user elsewhere.
        setApiKey(data[0].widget_api_key || generateApiKey());
      }
    } catch (e) {
      console.error("Failed to load businesses or user data:", e);
      setUser(null); // Clear user if fetching fails, leading to access restricted view
    }
    setIsLoading(false);
  };

  const generateApiKey = () => {
    return 'bb_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const embedCode = `<!-- BookBot AI Booking Widget -->
<!-- NOTE: In a real deployment, this script URL would point to your hosted widget file. -->
<script src="https://cdn.bookbot.ai/widget.js"></script>
<script>
  BookBot.init({
    apiKey: "${apiKey}",
    position: "${selectedBusiness?.widget_settings?.widget_position || 'bottom-right'}",
    primaryColor: "${selectedBusiness?.widget_settings?.primary_color || '#3B82F6'}",
    accentColor: "${selectedBusiness?.widget_settings?.accent_color || '#1D4ED8'}"
  });
</script>`;

  const wordpressCode = `// Add to your WordPress theme's functions.php
// NOTE: In a real deployment, this script URL would point to your hosted widget file.
function add_bookbot_widget() {
    ?>
    <script src="https://cdn.bookbot.ai/widget.js"></script>
    <script>
      BookBot.init({
        apiKey: "${apiKey}",
        position: "${selectedBusiness?.widget_settings?.widget_position || 'bottom-right'}",
        primaryColor: "${selectedBusiness?.widget_settings?.primary_color || '#3B82F6'}",
        accentColor: "${selectedBusiness?.widget_settings?.accent_color || '#1D4ED8'}"
      });
    </script>
    <?php
}
add_action('wp_footer', 'add_bookbot_widget');`;

  const reactCode = `// React/Next.js Integration
import { useEffect } from 'react';

export default function Layout({ children }) {
  useEffect(() => {
    // NOTE: In a real deployment, this script URL would point to your hosted widget file.
    const script = document.createElement('script');
    script.src = 'https://cdn.bookbot.ai/widget.js';
    script.onload = () => {
      window.BookBot.init({
        apiKey: "${apiKey}",
        position: "${selectedBusiness?.widget_settings?.widget_position || 'bottom-right'}",
        primaryColor: "${selectedBusiness?.widget_settings?.primary_color || '#3B82F6'}",
        accentColor: "${selectedBusiness?.widget_settings?.accent_color || '#1D4ED8'}"
      });
    };
    document.head.appendChild(script);
  }, []);

  return <div>{children}</div>;
}`;

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
                This area is for approved business owners only. Please ensure you are logged in with an account associated with a business.
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* User Info and Logout Button */}
        {user && (
          <div className="flex justify-end items-center mb-6">
            <span className="text-sm text-slate-600 mr-3 hidden sm:inline">Logged in as: <span className="font-medium text-slate-800">{user.email}</span></span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => User.logout()}
              className="group"
            >
              <ExternalLink className="w-4 h-4 mr-2 rotate-180 group-hover:rotate-0 transition-transform duration-300" />
              Logout
            </Button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Setup & Embed</h1>
          </div>
          <p className="text-slate-600">Simply copy and paste a small code snippet into your website to enable the AI widget.</p>
        </div>

        {businesses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Settings className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Business Found</h3>
              <p className="text-slate-500 mb-6">You need to set up your business profile first</p>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Create Business Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Business Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Business Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedBusiness?.id === business.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedBusiness(business)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-900">{business.name}</h3>
                          <p className="text-sm text-slate-500">{business.category.replace(/_/g, ' ')}</p>
                        </div>
                        <Badge 
                          className={business.subscription_status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-slate-100 text-slate-700'
                          }
                        >
                          {business.subscription_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Setup Guide */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Go Live</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: "Customize your settings",
                        description: "Use the Settings and Availability pages to set up your services, hours, and widget colors."
                      },
                      {
                        step: 2,
                        title: "Copy the integration code",
                        description: "Choose the appropriate code for your platform from the tabs on the right."
                      },
                      {
                        step: 3,
                        title: "Paste into your website",
                        description: "Add the code snippet to your website's HTML file before the closing {'</body>'} tag."
                      },
                      {
                        step: 4,
                        title: "That's it!",
                        description: "The widget will now be live on your site. Any future changes you make here will update automatically."
                      }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{item.title}</h4>
                          <p className="text-sm text-slate-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Code */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle>Test Your Widget</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-800 mb-4">
                    Before embedding the code on your live website, you can see a fully interactive preview on our demo page.
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link to={createPageUrl("Demo")}>
                      Go to Widget Demo
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Integration Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="html" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="html">HTML/JS</TabsTrigger>
                      <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                      <TabsTrigger value="react">React/Next.js</TabsTrigger>
                    </TabsList>

                    <TabsContent value="html" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Basic HTML Integration</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(embedCode, 'html')}
                          >
                            {copied === 'html' ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            Copy Code
                          </Button>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-slate-100 font-mono">
                            <code>{embedCode}</code>
                          </pre>
                        </div>
                        <p className="text-sm text-slate-600">
                          Add this code before the closing {'</body>'} tag of your website.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="wordpress" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">WordPress Integration</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(wordpressCode, 'wp')}
                          >
                            {copied === 'wp' ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            Copy Code
                          </Button>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-slate-100 font-mono">
                            <code>{wordpressCode}</code>
                          </pre>
                        </div>
                        <p className="text-sm text-slate-600">
                          Add this code to your WordPress theme's functions.php file.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="react" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">React/Next.js Integration</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(reactCode, 'react')}
                          >
                            {copied === 'react' ? <CheckCircle className="w-4 h-4 text-green-500 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            Copy Code
                          </Button>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-sm text-slate-100 font-mono">
                            <code>{reactCode}</code>
                          </pre>
                        </div>
                        <p className="text-sm text-slate-600">
                          Add this to your layout component or app wrapper.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="api-key">Your Website API Key</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="api-key"
                        value={apiKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey, 'api')}
                      >
                        {copied === 'api' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <strong>Important:</strong> This key links the widget to your business account. Keep it secure and only add it to websites you own.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
