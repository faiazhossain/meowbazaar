"use client";

import { cn } from "@/lib/utils";

interface CatLoaderProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function CatLoader({
  text = "লোড হচ্ছে...",
  className,
  size = "md",
  fullScreen = false,
}: CatLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const loader = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      <div className={cn("relative", sizeClasses[size])}>
        {/* Cat body */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-bounce"
          style={{ animationDuration: "0.6s" }}
        >
          {/* Cat body */}
          <ellipse
            cx="50"
            cy="60"
            rx="25"
            ry="18"
            fill="currentColor"
            className="text-primary"
          />

          {/* Cat head */}
          <circle
            cx="50"
            cy="35"
            r="18"
            fill="currentColor"
            className="text-primary"
          />

          {/* Left ear */}
          <polygon
            points="35,25 28,8 42,20"
            fill="currentColor"
            className="text-primary"
          />

          {/* Right ear */}
          <polygon
            points="65,25 72,8 58,20"
            fill="currentColor"
            className="text-primary"
          />

          {/* Inner left ear */}
          <polygon
            points="35,23 31,12 40,20"
            fill="currentColor"
            className="text-primary/60"
          />

          {/* Inner right ear */}
          <polygon
            points="65,23 69,12 60,20"
            fill="currentColor"
            className="text-primary/60"
          />

          {/* Left eye */}
          <ellipse cx="42" cy="33" rx="4" ry="5" fill="white" />
          <circle
            cx="43"
            cy="33"
            r="2"
            fill="black"
            className="animate-pulse"
          />

          {/* Right eye */}
          <ellipse cx="58" cy="33" rx="4" ry="5" fill="white" />
          <circle
            cx="59"
            cy="33"
            r="2"
            fill="black"
            className="animate-pulse"
          />

          {/* Nose */}
          <polygon points="50,40 47,44 53,44" fill="#FF6B6B" />

          {/* Mouth */}
          <path
            d="M 47 46 Q 50 50 53 46"
            stroke="#333"
            strokeWidth="1"
            fill="none"
          />

          {/* Whiskers left */}
          <line
            x1="30"
            y1="40"
            x2="40"
            y2="42"
            stroke="#333"
            strokeWidth="0.8"
          />
          <line
            x1="30"
            y1="44"
            x2="40"
            y2="44"
            stroke="#333"
            strokeWidth="0.8"
          />
          <line
            x1="30"
            y1="48"
            x2="40"
            y2="46"
            stroke="#333"
            strokeWidth="0.8"
          />

          {/* Whiskers right */}
          <line
            x1="70"
            y1="40"
            x2="60"
            y2="42"
            stroke="#333"
            strokeWidth="0.8"
          />
          <line
            x1="70"
            y1="44"
            x2="60"
            y2="44"
            stroke="#333"
            strokeWidth="0.8"
          />
          <line
            x1="70"
            y1="48"
            x2="60"
            y2="46"
            stroke="#333"
            strokeWidth="0.8"
          />

          {/* Front legs */}
          <rect
            x="38"
            y="72"
            width="6"
            height="14"
            rx="3"
            fill="currentColor"
            className="text-primary"
          />
          <rect
            x="56"
            y="72"
            width="6"
            height="14"
            rx="3"
            fill="currentColor"
            className="text-primary"
          />

          {/* Back legs */}
          <ellipse
            cx="32"
            cy="68"
            rx="8"
            ry="6"
            fill="currentColor"
            className="text-primary"
          />
          <ellipse
            cx="68"
            cy="68"
            rx="8"
            ry="6"
            fill="currentColor"
            className="text-primary"
          />

          {/* Tail */}
          <path
            d="M 75 60 Q 90 50 85 70 Q 80 85 70 75"
            fill="currentColor"
            className="text-primary origin-[75px_60px] animate-[wiggle_0.5s_ease-in-out_infinite]"
          />

          {/* Paws */}
          <ellipse
            cx="41"
            cy="86"
            rx="4"
            ry="2"
            fill="currentColor"
            className="text-primary/80"
          />
          <ellipse
            cx="59"
            cy="86"
            rx="4"
            ry="2"
            fill="currentColor"
            className="text-primary/80"
          />
        </svg>

        {/* Walking dots animation */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>

      {text && (
        <p className={cn("text-muted-foreground font-medium", textSizes[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {loader}
      </div>
    );
  }

  return loader;
}

// Page-level loader with navbar/footer space
export function PageLoader({ text }: { text?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <CatLoader text={text} size="lg" />
    </div>
  );
}
