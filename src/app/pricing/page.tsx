import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Users, Crown, Zap } from "lucide-react"

const pricingTiers = [
  {
    id: "solo",
    name: "Free Solo",
    price: "$0",
    description: "Perfect for individual hackers",
    features: [
      "1 active build at a time",
      "Basic AI prompts (50/month)",
      "Community support",
      "Hackathon templates"
    ],
    cta: "Get Started"
  },
  {
    id: "pro",
    name: "Hackathon Pro",
    price: "$29/team/month",
    description: "For small to medium teams (up to 10 members)",
    features: [
      "Unlimited active builds",
      "Unlimited AI prompts",
      "Priority support",
      "Custom hackathon themes",
      "Team collaboration"
    ],
    cta: "Choose Pro"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For large hackathons and organizations",
    features: [
      "Unlimited everything",
      "Dedicated support",
      "Advanced integrations",
      "Custom branding",
      "On-premise options",
      "SLA guarantees"
    ],
    cta: "Contact Us"
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Hackathon Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Scale your hackathon experience with plans designed for every team size. From solo hackers to enterprise events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <Card key={tier.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  {tier.id === "solo" && <CheckCircle className="h-12 w-12 text-primary" />}
                  {tier.id === "pro" && <Users className="h-12 w-12 text-primary" />}
                  {tier.id === "enterprise" && <Crown className="h-12 w-12 text-primary" />}
                </div>
                <CardTitle className="text-2xl text-center">{tier.name}</CardTitle>
                <CardDescription className="text-center text-lg">{tier.description}</CardDescription>
                <div className="text-center mt-6">
                  <div className="text-4xl font-bold text-primary">{tier.price}</div>
                  {tier.id !== "solo" && <p className="text-muted-foreground">per team/month</p>}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={tier.id === "pro" ? "default" : "outline"}>
                  {tier.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">Not sure which plan is right for you?</p>
          <Button asChild size="lg">
            <a href="/contact">Contact Sales</a>
          </Button>
        </div>
      </div>
    </div>
  )
}