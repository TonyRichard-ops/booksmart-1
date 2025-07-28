
import React, { useState } from "react";
import { InvokeLLM } from "@/api/integrations";
import { Appointment } from "@/api/entities";
import { Business } from "@/api/entities";
import { TimeSlot } from "@/api/entities";
import { BusinessHours } from "@/api/entities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Bot, User, Send, Calendar, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, parseISO, isSameDay } from "date-fns";

export default function BookingWidget({ business, onClose, settings }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: settings?.greeting_message || "Hi! I can help you book an appointment. What service are you interested in?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState({});
  const [currentStep, setCurrentStep] = useState("service");
  const [isMinimized, setIsMinimized] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAvailableSlots = async (selectedDate, serviceName) => {
    try {
      // Get business hours for the selected day
      const dayName = format(selectedDate, 'EEEE').toLowerCase();
      const businessHours = await BusinessHours.filter({ 
        business_id: business.id, 
        day_of_week: dayName 
      });

      if (!businessHours.length || !businessHours[0].is_open) {
        return [];
      }

      const { open_time, close_time, break_start, break_end } = businessHours[0];
      
      // Get existing appointments for this date
      const existingAppointments = await Appointment.filter({
        business_id: business.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd')
      });

      // Get service duration
      const service = business.services?.find(s => s.name === serviceName);
      const duration = service?.duration || 60; // Default to 60 minutes if not found

      // Generate available time slots
      const slots = [];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Parse times
      const [openHour, openMin] = open_time.split(':').map(Number);
      const [closeHour, closeMin] = close_time.split(':').map(Number);
      
      let currentHour = openHour;
      let currentMin = openMin;

      // Ensure we don't go past today's current time for today's slots
      const now = new Date();
      const isToday = isSameDay(selectedDate, now);
      
      while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
        const slotStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), currentHour, currentMin);
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000); // Add duration in milliseconds

        // If today, skip slots in the past
        if (isToday && slotStart < now) {
          // Move to next slot (30-minute intervals)
          currentMin += 30;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }
          continue;
        }

        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        
        // Check if this slot or any part of the service duration overlaps with a break
        let isDuringBreak = false;
        if (break_start && break_end) {
          const [breakStartHour, breakStartMin] = break_start.split(':').map(Number);
          const [breakEndHour, breakEndMin] = break_end.split(':').map(Number);
          
          const breakStartObj = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), breakStartHour, breakStartMin);
          const breakEndObj = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), breakEndHour, breakEndMin);

          // Check if slotStart or slotEnd fall within the break, or if break is fully contained within slot
          if (
              (slotStart < breakEndObj && slotEnd > breakStartObj) // Overlap check
          ) {
            isDuringBreak = true;
          }
        }

        if (isDuringBreak) {
          // If the slot overlaps with a break, we might need to skip this entire duration or adjust
          // For simplicity, we just skip the current 30-min block for now if it falls within the break.
          // A more complex scheduler would adjust the start time.
          currentMin += 30;
          if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
          }
          continue;
        }

        // Check if slot is already booked, considering service duration
        let isBooked = false;
        for (const apt of existingAppointments) {
          if (apt.status === 'cancelled') continue; // Ignore cancelled appointments

          const [aptHour, aptMin] = apt.appointment_time.split(':').map(Number);
          const aptStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), aptHour, aptMin);
          const aptEnd = new Date(aptStart.getTime() + apt.duration * 60 * 1000); // Use appointment's actual duration

          // Check for overlap: [slotStart, slotEnd) vs [aptStart, aptEnd)
          if (slotStart < aptEnd && slotEnd > aptStart) {
            isBooked = true;
            break;
          }
        }

        if (!isBooked && slotEnd.getHours() < closeHour || (slotEnd.getHours() === closeHour && slotEnd.getMinutes() <= closeMin)) {
           slots.push({
            date: dateStr,
            time: timeStr,
            display: format(slotStart, 'h:mm a')
          });
        }
        
        // Move to next slot (30-minute intervals for generating options)
        currentMin += 30;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
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
    const currentInput = inputValue; // Capture current input value
    setInputValue("");
    setIsLoading(true);

    try {
      // Create context about current booking progress
      const bookingContext = {
        business_name: business.name,
        services: business.services,
        current_booking_data: bookingData,
        current_step: currentStep,
        available_slots_count: availableSlots.length, // Provide count, not full list
      };

      const response = await InvokeLLM({
        prompt: `You are a smart AI booking assistant for ${business.name}. 
Your goal is to help the user book an appointment, collecting necessary information step-by-step.

Business Info:
- Name: ${business.name}
- Category: ${business.category}
- Services: ${JSON.stringify(business.services)}
- Business Hours are managed by the system.

Current booking progress: ${JSON.stringify(bookingData)}
Current step: ${currentStep}
User said: "${currentInput}"

Here's the required information flow, in order:
1.  **Service selection**: Ask "What service are you interested in?"
2.  **Customer Name**: Ask "What is your full name?"
3.  **Customer Email**: Ask "What is your email address?"
4.  **Customer Phone**: Ask "What is your phone number?" (Only ask if business.requires_phone is true or if indicated by prior interaction).
5.  **Appointment Date**: Ask "What date would you like to book your appointment for?"
6.  **Appointment Time**: Once a service and date are known, instruct me to 'show_availability' so I can fetch and display time slots. Then the user will select a time. If I respond with available slots, acknowledge them and ask the user to pick one. If no slots are available, suggest a different date.
7.  **Confirmation**: Once all required information (service, name, email, date, time) is gathered, ask "Does this all look correct? Shall I confirm your booking?" or "Ready to book?".

Be conversational and natural.
- Don't ask for information you already have (check current_booking_data).
- If the user provides multiple pieces of information at once, acknowledge all of it and then ask for the *next* piece of missing information in the flow.
- If you have service_name and appointment_date, set 'show_availability' to true in the response, and generate a message like "Checking availability for [Date] for [Service]..."
- If a date is provided, always parse it into 'YYYY-MM-DD' format.
- If a time is provided, always parse it into 'HH:MM' (24-hour) format.
- Do NOT generate lists of available times, only respond with a conversational message. My code will display available times if show_availability is true.
- When generating the final confirmation message, ensure it includes all collected details.

Example conversational flow:
User: I'd like a haircut.
Bot: Great choice! What's your name?
User: John Doe
Bot: Thanks, John. And your email?
User: john@example.com. I want it on Friday.
Bot: Got it, John. Checking availability for Friday, for a haircut... (LLM sets show_availability: true)
[My UI then displays slots]
User: I'll take 3 PM.
Bot: Okay, 3 PM on Friday. Just to confirm: a haircut for John Doe at 3 PM on [Date]. Shall I confirm?`,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            extracted_data: {
              type: "object",
              properties: {
                service_name: { type: "string" },
                customer_name: { type: "string" },
                customer_email: { type: "string" },
                customer_phone: { type: "string" },
                appointment_date: { type: "string", format: "date" }, // YYYY-MM-DD
                appointment_time: { type: "string", format: "time" }, // HH:MM
                notes: { type: "string" }
              }
            },
            next_step: { type: "string", enum: ["service", "name", "email", "phone", "date", "time", "confirm"] },
            show_availability: { type: "boolean" },
            ready_to_book: { type: "boolean" }
          },
          required: ["message", "next_step"]
        }
      });

      // Update booking data with any new information
      let newBookingData = { ...bookingData };
      if (response.extracted_data) {
        Object.keys(response.extracted_data).forEach(key => {
          if (response.extracted_data[key] !== undefined && response.extracted_data[key] !== null && response.extracted_data[key].toString().trim() !== "") {
            newBookingData[key] = response.extracted_data[key];
          }
        });
        setBookingData(newBookingData);
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.message,
        timestamp: new Date(),
        extractedData: response.extracted_data,
        nextStep: response.next_step,
        readyToBook: response.ready_to_book,
        showAvailability: response.show_availability
      };

      setMessages(prev => [...prev, botMessage]);
      setCurrentStep(response.next_step);

      // If we need to show availability and have both service and date
      if (response.show_availability && newBookingData.service_name && newBookingData.appointment_date) {
        const selectedDate = parseISO(newBookingData.appointment_date);
        const slots = await getAvailableSlots(selectedDate, newBookingData.service_name);
        setAvailableSlots(slots);
        
        if (slots.length > 0) {
          const availabilityMessage = {
            id: Date.now() + 2,
            type: "bot",
            content: `Here are the available times for ${format(selectedDate, 'EEEE, MMMM d')}:`,
            timestamp: new Date(),
            availableSlots: slots
          };
          setMessages(prev => [...prev, availabilityMessage]);
        } else {
          const noSlotsMessage = {
            id: Date.now() + 2,
            type: "bot",
            content: "Sorry, there are no available times for that date. Would you like to try a different date or service?",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, noSlotsMessage]);
        }
      }

      // If ready to book, create the appointment
      if (response.ready_to_book && newBookingData.service_name && newBookingData.customer_name && 
          newBookingData.customer_email && newBookingData.appointment_date && newBookingData.appointment_time) {
        await handleBookingSubmit(newBookingData);
      }

    } catch (error) {
      console.error("LLM or booking error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "I apologize, but I'm having trouble processing your request. Could you please try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleTimeSlotSelect = async (slot) => {
    const updatedBookingData = { 
      ...bookingData, 
      appointment_time: slot.time,
      appointment_date: slot.date 
    };
    setBookingData(updatedBookingData);

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: `I'd like the ${slot.display} appointment`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setAvailableSlots([]); // Clear available slots display after selection

    // Programmatically send a message to the LLM to get the next step or confirmation
    // This simulates the user's input of the selected time and continues the flow.
    setIsLoading(true);
    try {
      const response = await InvokeLLM({
        prompt: `You are a smart AI booking assistant for ${business.name}. 
The user has just selected a time slot: ${slot.time} on ${slot.date} for ${bookingData.service_name}.

Business Info:
- Name: ${business.name}
- Category: ${business.category}
- Services: ${JSON.stringify(business.services)}

Current booking progress: ${JSON.stringify({ ...bookingData, ...updatedBookingData })}
Current step: ${currentStep}

Based on the newly selected time, determine the next logical step. If all required information is gathered (service, name, email, date, time), ask for confirmation. Otherwise, ask for the missing information in the predefined order.`,
        response_json_schema: {
          type: "object",
          properties: {
            message: { type: "string" },
            extracted_data: {
              type: "object",
              properties: {
                service_name: { type: "string" },
                customer_name: { type: "string" },
                customer_email: { type: "string" },
                customer_phone: { type: "string" },
                appointment_date: { type: "string", format: "date" },
                appointment_time: { type: "string", format: "time" },
                notes: { type: "string" }
              }
            },
            next_step: { type: "string", enum: ["service", "name", "email", "phone", "date", "time", "confirm"] },
            show_availability: { type: "boolean" },
            ready_to_book: { type: "boolean" }
          },
          required: ["message", "next_step"]
        }
      });

      // Update booking data again with any final extractions, although it should be complete by now
      let finalBookingData = { ...updatedBookingData };
      if (response.extracted_data) {
        Object.keys(response.extracted_data).forEach(key => {
          if (response.extracted_data[key] !== undefined && response.extracted_data[key] !== null && response.extracted_data[key].toString().trim() !== "") {
            finalBookingData[key] = response.extracted_data[key];
          }
        });
        setBookingData(finalBookingData);
      }

      const botResponseForSlot = {
        id: Date.now() + 1,
        type: "bot",
        content: response.message,
        timestamp: new Date(),
        extractedData: response.extracted_data,
        nextStep: response.next_step,
        readyToBook: response.ready_to_book
      };
      setMessages(prev => [...prev, botResponseForSlot]);
      setCurrentStep(response.next_step);

      // If ready to book, create the appointment
      if (response.ready_to_book && finalBookingData.service_name && finalBookingData.customer_name && 
          finalBookingData.customer_email && finalBookingData.appointment_date && finalBookingData.appointment_time) {
        await handleBookingSubmit(finalBookingData);
      }
    } catch (error) {
      console.error("LLM or booking error after slot selection:", error);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "I apologize, but I'm having trouble processing your request after selecting the time. Could you please try again?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  const handleBookingSubmit = async (finalBookingData) => {
    try {
      const selectedService = business.services?.find(s => s.name === finalBookingData.service_name);
      
      await Appointment.create({
        business_id: business.id,
        service_name: finalBookingData.service_name,
        customer_name: finalBookingData.customer_name,
        customer_email: finalBookingData.customer_email,
        customer_phone: finalBookingData.customer_phone,
        appointment_date: finalBookingData.appointment_date,
        appointment_time: finalBookingData.appointment_time,
        notes: finalBookingData.notes || "",
        duration: selectedService?.duration || 60,
        price: selectedService?.price || 0,
        status: "pending", // Or "confirmed" if instant booking is allowed
        widget_session_id: `widget_${Date.now()}`
      });

      const confirmationMessage = {
        id: Date.now() + 2,
        type: "bot",
        content: `🎉 Perfect! Your appointment has been booked successfully!

📅 Service: ${finalBookingData.service_name}
👤 Name: ${finalBookingData.customer_name}
📧 Email: ${finalBookingData.customer_email}
${finalBookingData.customer_phone ? `📞 Phone: ${finalBookingData.customer_phone}` : ''}
🗓️ Date: ${format(parseISO(finalBookingData.appointment_date), "EEEE, MMMM d, yyyy")}
⏰ Time: ${format(parseISO(`2000-01-01T${finalBookingData.appointment_time}`), 'h:mm a')}

You'll receive a confirmation email shortly. ${business.name} will contact you if any changes are needed. Thank you for booking with us!`,
        timestamp: new Date(),
        isConfirmation: true
      };

      setMessages(prev => [...prev, confirmationMessage]);
    } catch (error) {
      console.error("Error creating appointment:", error);
      const errorMessage = {
        id: Date.now() + 2,
        type: "bot",
        content: "I'm sorry, there was an error processing your booking. Please try again or call us directly.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleServiceSelect = (service) => {
    setBookingData(prev => ({ ...prev, service_name: service.name }));
    const message = {
      id: Date.now(),
      type: "user",
      content: `I'd like to book ${service.name}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    
    const botResponse = {
      id: Date.now() + 1,
      type: "bot",
      content: `Excellent choice! ${service.name} takes about ${service.duration} minutes and costs $${service.price}. What's your name?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botResponse]);
    setCurrentStep("name");
  };

  const widgetPosition = settings?.widget_position || "bottom-right";
  const primaryColor = settings?.primary_color || "#225740";
  const accentColor = settings?.accent_color || "#348255";

  const getPositionClasses = () => {
    switch (widgetPosition) {
      case "bottom-left":
        return "bottom-6 left-6";
      case "center":
        return "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      default:
        return "bottom-6 right-6";
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 md:w-96 h-[500px] widget-shadow flex flex-col"
          >
            <Card className="h-full flex flex-col bg-white border-2 border-slate-200">
              <CardHeader 
                className="p-4 border-b flex flex-row items-center justify-between text-white flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{business.name}</h3>
                    <p className="text-xs opacity-90">AI Booking Assistant</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-white hover:bg-white/20"
                    onClick={() => setIsMinimized(true)}
                  >
                    —
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-white hover:bg-white/20"
                    onClick={onClose}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Service Selection */}
                  {currentStep === "service" && settings?.show_services && business.services && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Available Services</p>
                      {business.services.slice(0, 3).map((service, index) => (
                        <button
                          key={index}
                          onClick={() => handleServiceSelect(service)}
                          className="w-full p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm text-slate-900">{service.name}</p>
                              <p className="text-xs text-slate-500">{service.duration} min</p>
                            </div>
                            <Badge variant="secondary" className="text-xs">${service.price}</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat Messages */}
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id}>
                        <div className={`flex gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                          {message.type === "bot" && (
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <Bot className="w-3 h-3 text-white" />
                            </div>
                          )}
                          
                          <div className={`max-w-[80%] ${message.type === "user" ? "order-1" : ""}`}>
                            <div className={`rounded-lg px-3 py-2 text-sm break-words ${
                              message.type === "user" 
                                ? "text-white" 
                                : "bg-slate-100 text-slate-900"
                            }`}
                            style={message.type === "user" ? { backgroundColor: accentColor } : {}}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                            {message.isConfirmation && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700 text-xs">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Booking confirmed!</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {message.type === "user" && (
                            <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <User className="w-3 h-3 text-slate-600" />
                            </div>
                          )}
                        </div>

                        {/* Available Time Slots */}
                        {message.availableSlots && message.availableSlots.length > 0 && (
                          <div className="mt-3 ml-8 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {message.availableSlots.slice(0, 6).map((slot, index) => (
                                <button
                                  key={index}
                                  onClick={() => handleTimeSlotSelect(slot)}
                                  className="p-2 text-sm border rounded-lg hover:bg-green-50 transition-colors"
                                  style={{ 
                                    borderColor: `${primaryColor}40`,
                                    '--tw-ring-color': primaryColor 
                                  }}
                                >
                                  {slot.display}
                                </button>
                              ))}
                            </div>
                            {message.availableSlots.length > 6 && (
                              <p className="text-xs text-slate-500 ml-2">
                                +{message.availableSlots.length - 6} more times available
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-slate-100 rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isLoading}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputValue.trim()}
                      size="icon"
                      className="flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Widget Button */}
      {isMinimized && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full text-white shadow-xl hover:scale-105 transition-transform"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}
        >
          <Bot className="w-6 h-6 mx-auto" />
        </motion.button>
      )}
    </div>
  );
}
