"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [role, setRole] = useState<string>("participant")
  const [authState, setAuthState] = useState<"logged_in" | "logged_out">("logged_in")
  const router = useRouter()

  useEffect(() => {
    const savedRole = localStorage.getItem("demoRole") || "participant"
    setRole(savedRole)
    const savedAuth = (localStorage.getItem("demoAuth") as "logged_in" | "logged_out" | null) || "logged_in"
    setAuthState(savedAuth)
  }, [])

  const handleRoleChange = (value: string) => {
    setRole(value)
    localStorage.setItem("demoRole", value)
  }

  const handleAuthChange = (value: "logged_in" | "logged_out") => {
    setAuthState(value)
    localStorage.setItem("demoAuth", value)
    // Optional UX: navigate to relevant area based on state
    if (value === "logged_in") {
      router.push("/hackathons")
    } else {
      router.push("/")
    }
  }

  const handleBack = () => {
    router.push("/hackathons/demo_hackathon")
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Demo Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="auth">Auth state (temporary)</Label>
            <Select value={authState} onValueChange={(v) => handleAuthChange(v as any)}>
              <SelectTrigger id="auth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logged_in">Logged in</SelectItem>
                <SelectItem value="logged_out">Logged out</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Controls which nav items are visible. Logged out shows Home and Pricing; Logged in shows Home and Hackathons.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Choose your role</Label>
            <Select value={role} onValueChange={handleRoleChange}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Participant (Student View)</SelectItem>
                <SelectItem value="organizer">Organizer (Admin Dashboard)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This sets your view in the hackathon demo. Changes are saved locally.
            </p>
          </div>

          <Button onClick={handleBack} className="w-full">
            Back to Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}