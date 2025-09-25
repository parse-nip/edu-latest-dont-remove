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
  const router = useRouter()

  useEffect(() => {
    const savedRole = localStorage.getItem("demoRole") || "participant"
    setRole(savedRole)
  }, [])

  const handleRoleChange = (value: string) => {
    setRole(value)
    localStorage.setItem("demoRole", value)
  }

  const handleBack = () => {
    router.push("/hackathons/demo")
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
        <CardContent className="space-y-4">
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