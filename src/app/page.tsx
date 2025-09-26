"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = [
    "Health & Wellness",
    "Travel Planning",
    "CRM",
    "Productivity",
    "Entertainment",
  ];

  const handleCategoryClick = (category: string) => {
    if (isSubmitting) return;
    setPrompt((prev) => (prev ? `${prev} ${category}` : category));
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    // Check if user is authenticated
    if (!user) {
      router.push('/auth');
      return;
    }
    
    router.push(`/chat?prompt=${encodeURIComponent(prompt.trim())}`);
    setPrompt("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Ready to build?
          </h1>
          <p className="text-muted-foreground">
            Describe your app idea in the chat below to get started.
          </p>
        </div>

        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your first prompt, e.g., 'Build a fitness tracker app...'"
            className="min-h-[120px] pr-12 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            size="sm"
            className="absolute bottom-3 right-3 h-8 w-8 rounded-full p-0 disabled:opacity-50"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Or get inspired:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Badge>
            ))}
            <Badge variant="outline">More</Badge>
          </div>
        </div>

        <div className="w-full mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">Your Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Empty state for now; replace with dynamic app cards later */}
            <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">No apps created yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Start a chat above to build your first app!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}