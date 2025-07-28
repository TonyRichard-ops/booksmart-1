import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: 29.99,
    icon: Star,
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 50 bookings per month",
      "Basic scheduling tools",
      "Email notifications",
      "Customer management",
      "Basic analytics"
    ],
    popular: false
  },
  {
    name: "Premium",
    price: 59.99,
    icon: Zap,
    description: "Ideal for growing businesses",
    features: [
      "Unlimited bookings",
      "Advanced scheduling",
      "SMS & email notifications",
      "Customer management",
      "Advanced analytics",
      "Priority support",
      "Custom branding"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: 99.99,
    icon: Crown,
    description: "For large businesses and chains",
    features: [
      "Everything in Premium",
      "Multiple location support",
      "API access",
      "White-label solution",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting"
    ],
    popular: false
  }
];

export default function SubscriptionPlans({ businesses }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Plan</h2>
        <p className="text-slate-600">Select the perfect plan for your business needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-slate-900 shadow-xl' : 'hover:shadow-lg'} transition-all`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-slate-900 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  plan.popular ? 'bg-slate-900' : 'bg-slate-100'
                }`}>
                  <IconComponent className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-slate-900">
                  ${plan.price}
                  <span className="text-base font-normal text-slate-500">/month</span>
                </div>
                <p className="text-sm text-slate-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-slate-900 hover:bg-slate-800' 
                      : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300'
                  }`}
                >
                  {plan.popular ? 'Get Started' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Need a Custom Solution?</h3>
          <p className="text-slate-600 mb-4">
            Contact our sales team for enterprise pricing and custom features tailored to your business.
          </p>
          <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}