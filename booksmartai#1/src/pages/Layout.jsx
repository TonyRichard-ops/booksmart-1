

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities"; // Changed import path for User
import { Business } from "@/api/entities"; // Added import for Business
import { Bot, Settings, Code, Calendar, BarChart3, Clock, Building, Shield, MessageSquare, LogOut, User as UserIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "AI Chat",
    url: createPageUrl("Chat"),
    icon: MessageSquare,
    public: true
  },
  {
    title: "Discover",
    url: createPageUrl("Discover"),
    icon: Bot,
    public: true
  },
  {
    title: "My Bookings",
    url: createPageUrl("Bookings"),
    icon: Calendar,
    public: true
  }
];

const businessOwnerItems = [
  {
    title: "Widget Demo",
    url: createPageUrl("Demo"),
    icon: Bot,
  },
  {
    title: "Setup & Embed",
    url: createPageUrl("Setup"),
    icon: Code,
  },
  {
    title: "Appointments",
    url: createPageUrl("Appointments"),
    icon: Calendar,
  },
  {
    title: "Availability",
    url: createPageUrl("AvailabilitySettings"),
    icon: Clock,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

const publicPages = [
  {
    title: "Business Signup",
    url: createPageUrl("BusinessSignup"),
    icon: Building,
    description: "Apply to join BookBot"
  },
  {
    title: "Admin Panel",
    url: createPageUrl("AdminPanel"),
    icon: Shield,
    description: "Admin only"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [hasBusinessAccess, setHasBusinessAccess] = React.useState(false);

  React.useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      // User is now imported from "@/api/entities" and is assumed to have a .me() method.
      const currentUser = await User.me();
      setUser(currentUser);
      
      if (currentUser.role === 'admin') {
        setHasBusinessAccess(true);
      } else {
        // Business entity is now directly imported, no dynamic import needed
        // Assumes Business.filter() is implemented within the Business entity
        const userBusinesses = await Business.filter({ owner_email: currentUser.email });
        setHasBusinessAccess(userBusinesses.length > 0);
      }
    } catch (e) {
      console.error("Failed to check user access:", e);
      setUser(null);
      setHasBusinessAccess(false);
    }
  };

  const handleLogout = async () => {
    await User.logout(); // Assumes User.logout() is implemented in "@/api/entities"
    window.location.reload(); // Reload to clear all state and redirect to login if necessary
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --background: 90 25% 98%;
            --foreground: 153 28% 14%;
            --primary: 155 43% 24%;
            --primary-foreground: 0 0% 100%;
            --secondary: 120 17% 95%;
            --secondary-foreground: 155 43% 24%;
            --accent: 155 42% 36%;
            --accent-foreground: 0 0% 100%;
            --muted: 120 17% 95%;
            --muted-foreground: 145 10% 36%;
            --card: 0 0% 100%;
            --card-foreground: 153 28% 14%;
            --border: 130 21% 88%;
            --ring: 155 43% 24%;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, hsl(210, 20%, 98%) 0%, hsl(120, 17%, 95%) 100%);
          }
          
          .gradient-bg {
            background: linear-gradient(135deg, #225740 0%, #348255 100%);
          }
          
          .widget-shadow {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
        `}
      </style>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">BookBot</h2>
                <p className="text-xs text-slate-500 font-medium">AI Booking Widget</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Customer Features
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group hover:bg-green-50/80 transition-all duration-200 rounded-xl ${
                          location.pathname === item.url 
                            ? 'gradient-bg text-white' 
                            : 'text-slate-700 hover:text-green-900'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5 transition-colors ${
                            location.pathname === item.url ? 'text-white' : 'text-slate-500 group-hover:text-green-700'
                          }`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {hasBusinessAccess && (
              <SidebarGroup className="mt-8">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                  Business Management
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {businessOwnerItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`group hover:bg-green-50/80 transition-all duration-200 rounded-xl ${
                            location.pathname === item.url 
                              ? 'gradient-bg text-white' 
                              : 'text-slate-700 hover:text-green-900'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 transition-colors ${
                              location.pathname === item.url ? 'text-white' : 'text-slate-500 group-hover:text-green-700'
                            }`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Public Pages
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {publicPages.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group hover:bg-green-50/80 transition-all duration-200 rounded-xl ${
                          location.pathname === item.url 
                            ? 'gradient-bg text-white' 
                            : 'text-slate-700 hover:text-green-900'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5 transition-colors ${
                            location.pathname === item.url ? 'text-white' : 'text-slate-500 group-hover:text-green-700'
                          }`} />
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            <span className="text-xs opacity-70">{item.description}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Active Widgets</span>
                    <span className="font-bold text-slate-900">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">This Month</span>
                    <span className="font-bold text-green-600">127 bookings</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Conversion Rate</span>
                    <span className="font-bold text-green-700">23%</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.role === 'admin' ? 'Admin' : hasBusinessAccess ? 'Business Owner' : 'Customer'}
                    </p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">BookBot</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

