"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter()
  const [displayName, setDisplayName] = useState(user?.displayName || "")

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/auth')}>
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    // TODO: Update user profile via Supabase
    console.log("Saving settings...", { displayName });
  }

  const handleBack = () => {
    router.back();
    }


  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
            />
            <p className="text-sm text-muted-foreground">
              This is how your name appears to other participants.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button onClick={handleBack} variant="outline">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}