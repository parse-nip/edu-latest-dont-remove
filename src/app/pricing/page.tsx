"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Check, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// NumberFlow component implementation
interface NumberFlowProps {
  value: number
  format?: Intl.NumberFormatOptions
  className?: string
  suffix?: string
}

function NumberFlow({ value, format, className, suffix = "" }: NumberFlowProps) {
  return (
    <motion.span
      key={value}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {format ? new Intl.NumberFormat('en-US', format).format(value) : value}{suffix}
    </motion.span>
  )
}

// Main pricing component
export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  buttonText: string
  popular?: boolean
  additionalInfo?: string[]
}

export interface HackathonPlan {
  id: string
  name: string
  description: string
  price: number
  users: number
  hackathons?: number
  features: string[]
  buttonText: string
  additionalCost?: string
}

export interface AIPoweredPricingProps {
  className?: string
}

const individualPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free Tier",
    description: "Limited access to basic models for individual developers",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "20 credits per month",
      "Access to basic models only",
      "5 builds per day limit",
      "Community support",
      "Basic templates"
    ],
    buttonText: "Get Started Free",
    additionalInfo: ["Perfect for learning and experimentation"]
  },
  {
    id: "plus",
    name: "Plus Tier",
    description: "Full access to basic models with enhanced limits",
    monthlyPrice: 20,
    yearlyPrice: 200,
    features: [
      "100 credits per month",
      "Access to basic + limited paid models",
      "No daily access limit",
      "Email support",
      "Premium templates",
      "Export capabilities"
    ],
    buttonText: "Upgrade to Plus",
    popular: true,
    additionalInfo: ["Most popular for individual developers"]
  },
  {
    id: "pro",
    name: "Pro Tier",
    description: "Full access to all models for professional development",
    monthlyPrice: 50,
    yearlyPrice: 500,
    features: [
      "250 credits per month",
      "Access to all basic and advanced models",
      "No daily access limit",
      "Priority support",
      "Advanced templates",
      "Team collaboration",
      "API access"
    ],
    buttonText: "Go Pro",
    additionalInfo: ["Best for professional developers and small teams"]
  }
]

const hackathonPlans: HackathonPlan[] = [
  {
    id: "one-hackathon",
    name: "One Hackathon",
    description: "Perfect for schools organizing their first hackathon",
    price: 499,
    users: 50,
    features: [
      "50 users with Plus tier access",
      "2 weeks duration maximum",
      "Full AI model access",
      "Dedicated support channel",
      "Custom branding options",
      "$3 per additional user past 50"
    ],
    buttonText: "Book One Hackathon",
    additionalCost: "$3 per user past 50"
  },
  {
    id: "many-hackathons",
    name: "Many Hackathons",
    description: "For institutions running multiple events throughout the year",
    price: 2999,
    users: 100,
    hackathons: 10,
    features: [
      "100 users per hackathon",
      "10 hackathons per year",
      "Plus tier access for all users",
      "2 weeks duration per event",
      "Priority support",
      "Advanced analytics",
      "$3 per additional user past 100"
    ],
    buttonText: "Choose Many Hackathons",
    popular: true,
    additionalCost: "$3 per user past 100"
  },
  {
    id: "many-many-hackathons",
    name: "Many Many Hackathons",
    description: "Enterprise solution for large institutions and organizations",
    price: 13999,
    users: 200,
    hackathons: 30,
    features: [
      "200 users per hackathon",
      "30 hackathons per year",
      "Plus tier access for all users",
      "2 weeks duration per event",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options"
    ],
    buttonText: "Enterprise Solution"
  }
]

function AIPoweredPricing({ className }: AIPoweredPricingProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [activeTab, setActiveTab] = useState("individual")

  const toggleBilling = () => {
    setIsYearly(!isYearly)
  }

  return (
    <section className={cn("py-16 px-4 bg-background", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            AI-Powered App Builder
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Build powerful applications with AI assistance. Choose the plan that fits your needs.
          </p>
        </div>

        {/* Tabs for Individual vs Hackathon pricing */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="hackathon">Schools & Organizations</TabsTrigger>
          </TabsList>

          {/* Individual Plans */}
          <TabsContent value="individual" className="space-y-8">
            {/* Billing Toggle */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <span className={cn("text-sm", !isYearly ? "text-foreground" : "text-muted-foreground")}>
                Monthly
              </span>
              <button
                onClick={toggleBilling}
                className="relative w-12 h-6 bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-primary rounded-full"
                  animate={{ x: isYearly ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={cn("text-sm", isYearly ? "text-foreground" : "text-muted-foreground")}>
                Yearly
                <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </span>
            </div>

            {/* Individual Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {individualPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "relative h-full",
                    plan.popular && "border-primary shadow-lg ring-1 ring-primary/20"
                  )}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      
                      <div className="mt-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold">
                            $<AnimatePresence mode="wait">
                              <NumberFlow
                                value={isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                                className="text-4xl font-bold"
                              />
                            </AnimatePresence>
                          </span>
                          <span className="text-muted-foreground ml-1">
                            /{isYearly ? "year" : "month"}
                          </span>
                        </div>
                        {isYearly && plan.monthlyPrice > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            ${(plan.yearlyPrice / 12).toFixed(2)}/month billed annually
                          </p>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <Button 
                        className={cn(
                          "w-full mb-6",
                          plan.popular ? "bg-primary hover:bg-primary/90" : ""
                        )}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.additionalInfo && (
                        <div className="mt-6 pt-4 border-t">
                          {plan.additionalInfo.map((info, infoIndex) => (
                            <p key={infoIndex} className="text-xs text-muted-foreground italic">
                              {info}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Hackathon Plans */}
          <TabsContent value="hackathon" className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-2">Hackathon Packages</h3>
              <p className="text-muted-foreground">
                Special pricing for educational institutions and organizations hosting hackathons
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {hackathonPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "h-full",
                    plan.popular && "border-primary shadow-lg ring-1 ring-primary/20"
                  )}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      
                      <div className="mt-4">
                        <div className="flex items-baseline justify-center">
                          <span className="text-4xl font-bold">
                            ${plan.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {plan.users} users included
                          </p>
                          {plan.hackathons && (
                            <p className="text-sm text-muted-foreground">
                              {plan.hackathons} hackathons per year
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <Button 
                        className={cn(
                          "w-full mb-6",
                          plan.popular ? "bg-primary hover:bg-primary/90" : ""
                        )}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>

                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.additionalCost && (
                        <div className="mt-6 pt-4 border-t">
                          <p className="text-xs text-muted-foreground">
                            Additional cost: {plan.additionalCost}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            All plans include access to our AI-powered app builder with hackathon-focused features.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            Need a custom solution? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default function PricingPage() {
  return <AIPoweredPricing />
}