import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <Button asChild variant="outline">
          <Link href="/settings">Settings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/avatar.jpg" alt="Demo User" />
            <AvatarFallback>DU</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">Demo User</CardTitle>
            <p className="text-sm text-muted-foreground">demo.user@example.com</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">
              This is a placeholder profile. Hook this up to your auth system to populate real user data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/hackathons">Go to Hackathons</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}