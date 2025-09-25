import { cn } from "@/lib/utils";

export interface PulsingDotProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulsingDot({ size = "md", className }: PulsingDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3", 
    lg: "w-4 h-4",
  } as const;

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          "bg-primary rounded-full",
          sizeClasses[size],
          className
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-primary rounded-full animate-ripple",
          sizeClasses[size]
        )}
      />
      <span className="sr-only">Loading</span>
    </div>
  );
}