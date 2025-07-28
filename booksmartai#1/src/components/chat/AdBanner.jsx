
import React, { useState, useEffect } from "react";
import { Advertisement } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdBanner() {
  const [ads, setAds] = useState([]);
  const [currentAd, setCurrentAd] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    const adData = await Advertisement.list();
    const activeAds = adData.filter(ad => ad.status === "active");
    setAds(activeAds);
    if (activeAds.length > 0) {
      setCurrentAd(activeAds[Math.floor(Math.random() * activeAds.length)]);
    }
  };

  const handleAdClick = () => {
    if (currentAd) {
      window.open(currentAd.target_url, "_blank");
      // In a real app, you'd increment the clicks count here
    }
  };

  if (!currentAd || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-stone-50 to-green-50/30 border-stone-200 hover:shadow-md transition-shadow cursor-pointer" onClick={handleAdClick}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-700">
                Sponsored
              </Badge>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              {currentAd.image_url && (
                <img
                  src={currentAd.image_url}
                  alt={currentAd.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">{currentAd.title}</h3>
                <p className="text-sm text-slate-600 mb-2">{currentAd.description}</p>
                <div className="flex items-center gap-2 text-xs text-green-800">
                  <ExternalLink className="w-3 h-3" />
                  <span>Learn more</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
