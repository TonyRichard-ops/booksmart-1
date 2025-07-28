
import React, { useState, useEffect, useRef } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Business } from "@/api/entities";
import { Appointment } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, MapPin, Clock, Phone, Mail, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdBanner from "../components/chat/AdBanner";
import BookingConfirmation from "../components/chat/BookingConfirmation";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "👋 Hi! I'm your AI booking assistant. I can help you find and book appointments at nearby businesses. What are you looking for today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [showBooking, setShowBooking] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadBusinesses = async () => {
    const data = await Business.list();
    setBusinesses(data);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const businessContext = businesses.map(b => ({
        id: b.id,
        name: b.name,
        category: b.category,
        address: b.address,
        services: b.services,
        hours: b.hours,
        phone: b.phone
      }));

      const response = await InvokeLLM({
        prompt: `You are a helpful AI assistant for an appointment booking app. The user said: "${inputValue}"

Available businesses:
${JSON.stringify(businessContext, null, 2)}

Help the user find and book appointments. If they're looking for a specific service, recommend relevant businesses. If they want to book, ask for their details (name, email, phone, preferred date/time).

Be conversational, helpful, and professional. Keep responses concise but informative.`,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            recommended_businesses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  category: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            action: { type: "string", enum: ["none", "show_businesses", "request_booking_details"] }
          }
        }
      });

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.message,
        timestamp: new Date(),
        recommendations: response.recommended_businesses || [],
        action: response.action
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleBusinessSelect = (business) => {
    setShowBooking(business);
  };

  const handleBookingComplete = (bookingData) => {
    const confirmationMessage = {
      id: Date.now(),
      type: "bot",
      content: `✅ Great! I've submitted your appointment request for ${bookingData.service_name} at ${bookingData.business_name}. They'll contact you shortly to confirm your ${bookingData.appointment_date} appointment.`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, confirmationMessage]);
    setShowBooking(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <div className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Booking Assistant</h1>
              <p className="text-slate-600">Find and book appointments instantly</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AdBanner />
          
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "bot" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-2xl ${message.type === "user" ? "order-1" : ""}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.type === "user" 
                      ? "bg-slate-900 text-white" 
                      : "bg-white border border-slate-200 shadow-sm"
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  {message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.recommendations.map((rec) => {
                        const business = businesses.find(b => b.id === rec.id);
                        if (!business) return null;
                        
                        return (
                          <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleBusinessSelect(business)}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-slate-900">{business.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {business.category.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-xs text-slate-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{business.address}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span>{business.phone}</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 mt-2">{rec.reason}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {message.type === "user" && (
                  <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-slate-200 bg-white">
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about booking appointments..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 rounded-xl border-slate-300 focus:border-slate-500 focus:ring-slate-500"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-slate-900 hover:bg-slate-800 rounded-xl px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingConfirmation
          business={showBooking}
          onClose={() => setShowBooking(null)}
          onComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}
