
import React, { useState, useEffect } from "react";
import { Business } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Phone, Clock, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BusinessCard from "../components/discover/BusinessCard";
import MapView from "../components/discover/MapView";

export default function Discover() {
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "restaurant", label: "Restaurants" },
    { value: "salon", label: "Salons" },
    { value: "spa", label: "Spas" },
    { value: "medical", label: "Medical" },
    { value: "dental", label: "Dental" },
    { value: "fitness", label: "Fitness" },
    { value: "automotive", label: "Automotive" },
    { value: "beauty", label: "Beauty" },
    { value: "wellness", label: "Wellness" }
  ];

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, selectedCategory]);

  const loadBusinesses = async () => {
    setIsLoading(true);
    const data = await Business.list();
    setBusinesses(data);
    setIsLoading(false);
  };

  const filterBusinesses = () => {
    let filtered = businesses;

    if (searchQuery) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(business => business.category === selectedCategory);
    }

    setFilteredBusinesses(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover Local Businesses</h1>
          <p className="text-slate-600">Find and book appointments with top-rated businesses near you</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search businesses, services, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-slate-300 focus:border-slate-500"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48 h-12 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              className="h-12 px-6 rounded-xl"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              onClick={() => setViewMode("map")}
              className="h-12 px-6 rounded-xl"
            >
              Map
            </Button>
          </div>
        </div>

        {viewMode === "map" ? (
          <MapView businesses={filteredBusinesses} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">
                {isLoading ? "Loading..." : `Found ${filteredBusinesses.length} businesses`}
              </p>
            </div>

            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="h-80 animate-pulse">
                      <div className="h-48 bg-slate-200 rounded-t-lg" />
                      <CardContent className="p-4 space-y-3">
                        <div className="h-4 bg-slate-200 rounded" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredBusinesses.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))
                )}
              </div>
            </AnimatePresence>

            {!isLoading && filteredBusinesses.length === 0 && (
              <div className="text-center py-16">
                <Navigation className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No businesses found</h3>
                <p className="text-slate-500">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
