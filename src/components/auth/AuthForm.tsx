"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signUp, signIn, type UserRole } from "@/lib/auth"
import { AlertCircle, User, UserCheck, Crown } from "lucide-react"

export function AuthForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Sign up form state
  const [signUpForm, setSignUpForm] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "participant" as UserRole,
    joinCode: ""
  })
  
  // Sign in form state
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: ""
  })

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { data, error } = await signUp(
      signUpForm.email,
      signUpForm.password,
      signUpForm.displayName,
      signUpForm.role,
      signUpForm.joinCode || undefined
    )

    if (error) {
      setError(error.message)
    } else {
      router.push("/hackathons")
    }
    
    setIsLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { data, error } = await signIn(signInForm.email, signInForm.password)

    if (error) {
      setError(error.message)
    } else {
      router.push("/hackathons")
    }
    
    setIsLoading(false)
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "participant":
        return <User className="h-4 w-4" />
      case "judge":
        return <UserCheck className="h-4 w-4" />
      case "organizer":
        return <Crown className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription>
            Join hackathons and build amazing projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signInForm.email}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Your Name"
                    value={signUpForm.displayName}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, displayName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={signUpForm.email}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpForm.password}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={signUpForm.role} 
                    onValueChange={(value: UserRole) => setSignUpForm(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participant">
                        <div className="flex items-center gap-2">
                          {getRoleIcon("participant")}
                          Participant
                        </div>
                      </SelectItem>
                      <SelectItem value="judge">
                        <div className="flex items-center gap-2">
                          {getRoleIcon("judge")}
                          Judge
                        </div>
                      </SelectItem>
                      <SelectItem value="organizer">
                        <div className="flex items-center gap-2">
                          {getRoleIcon("organizer")}
                          Organizer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join-code">Hackathon Join Code (Optional)</Label>
                  <Input
                    id="join-code"
                    placeholder="Enter code from your organizer"
                    value={signUpForm.joinCode}
                    onChange={(e) => setSignUpForm(prev => ({ ...prev, joinCode: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to browse public hackathons
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="flex items-center gap-2 p-3 mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}