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
    if (!prompt.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Check if user is authenticated
    if (!user) {
      router.push('/auth');
      return;
    }
    
    // Redirect to universal-builder with the prompt
    router.push(`/universal-builder?prompt=${encodeURIComponent(prompt.trim())}`);
    setPrompt("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Start Building Your App
          </h1>
          <p className="text-muted-foreground text-lg">
            Describe your app idea below and we'll create it for you
          </p>
        </div>

        <div className="relative">
           <Textarea
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="Describe your app idea, e.g., 'Build a fitness tracker app with workout logging and progress charts...'"
             className="min-h-[140px] pr-16 resize-none text-base"
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
             disabled={!prompt.trim() || isSubmitting}
             size="sm"
             className="absolute bottom-3 right-3 h-10 w-10 rounded-full p-0 disabled:opacity-50"
           >
             <ArrowRight className="h-5 w-5" />
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

      </div>
    </div>
  );
}