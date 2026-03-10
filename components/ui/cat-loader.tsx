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
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const loader = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        className
      )}
    >
      {/* Centered walking cat */}
      <div className={cn("relative", sizeClasses[size])}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Cat body - with slight bounce */}
          <ellipse
            cx="50"
            cy="60"
            rx="22"
            ry="16"
            fill="currentColor"
            className="text-primary animate-body-bounce"
          />

          {/* Cat head - with slight nod */}
          <g className="animate-head-nod">
            <circle
              cx="50"
              cy="38"
              r="16"
              fill="currentColor"
              className="text-primary"
            />

            {/* Ears - twitching */}
            <g className="animate-ear-twitch">
              <polygon
                points="38,28 32,14 44,24"
                fill="currentColor"
                className="text-primary"
              />
              <polygon
                points="62,28 68,14 56,24"
                fill="currentColor"
                className="text-primary"
              />
            </g>

            {/* Inner ears */}
            <polygon
              points="39,26 35,17 43,23"
              fill="currentColor"
              className="text-primary/60"
            />
            <polygon
              points="61,26 65,17 57,23"
              fill="currentColor"
              className="text-primary/60"
            />
          </g>

          {/* Eyes - gentle blinking */}
          <g className="animate-gentle-blink">
            {/* Left eye */}
            <ellipse cx="42" cy="36" rx="3.5" ry="4" fill="white" />
            <circle cx="43" cy="36" r="1.8" fill="black" />
            {/* Right eye */}
            <ellipse cx="58" cy="36" rx="3.5" ry="4" fill="white" />
            <circle cx="59" cy="36" r="1.8" fill="black" />
          </g>

          {/* Nose */}
          <polygon points="50,42 47,46 53,46" fill="#FF9F9F" />

          {/* Mouth - slight smile */}
          <path
            d="M 47 48 Q 50 51 53 48"
            stroke="#666"
            strokeWidth="1"
            fill="none"
            className="animate-smile"
          />

          {/* Whiskers - gentle movement */}
          <g className="animate-whisker">
            <line
              x1="32"
              y1="42"
              x2="42"
              y2="43"
              stroke="#666"
              strokeWidth="0.6"
            />
            <line
              x1="32"
              y1="45"
              x2="42"
              y2="45"
              stroke="#666"
              strokeWidth="0.6"
            />
            <line
              x1="32"
              y1="48"
              x2="42"
              y2="47"
              stroke="#666"
              strokeWidth="0.6"
            />
            <line
              x1="68"
              y1="42"
              x2="58"
              y2="43"
              stroke="#666"
              strokeWidth="0.6"
            />
            <line
              x1="68"
              y1="45"
              x2="58"
              y2="45"
              stroke="#666"
              strokeWidth="0.6"
            />
            <line
              x1="68"
              y1="48"
              x2="58"
              y2="47"
              stroke="#666"
              strokeWidth="0.6"
            />
          </g>

          {/* Walking legs animation */}
          <g className="animate-legs">
            {/* Front left leg */}
            <rect
              x="38"
              y="70"
              width="6"
              height="14"
              rx="3"
              fill="currentColor"
              className="text-primary leg-fl"
            />
            {/* Front right leg */}
            <rect
              x="56"
              y="70"
              width="6"
              height="14"
              rx="3"
              fill="currentColor"
              className="text-primary leg-fr"
            />
            {/* Back left leg */}
            <ellipse
              cx="32"
              cy="68"
              rx="8"
              ry="5"
              fill="currentColor"
              className="text-primary leg-bl"
            />
            {/* Back right leg */}
            <ellipse
              cx="68"
              cy="68"
              rx="8"
              ry="5"
              fill="currentColor"
              className="text-primary leg-br"
            />
          </g>

          {/* Paws - gentle padding */}
          <ellipse
            cx="41"
            cy="84"
            rx="4"
            ry="2"
            fill="currentColor"
            className="text-primary/80 paw-left"
          />
          <ellipse
            cx="59"
            cy="84"
            rx="4"
            ry="2"
            fill="currentColor"
            className="text-primary/80 paw-right"
          />

          {/* Tail - graceful sway */}
          <path
            d="M 78 60 Q 88 50 84 68 Q 80 78 72 72"
            fill="currentColor"
            className="text-primary animate-tail-sway"
          />

          {/* Walking trail effect - subtle dots */}
          <circle
            cx="30"
            cy="78"
            r="2"
            fill="currentColor"
            className="text-primary/20 animate-trail-1"
          />
          <circle
            cx="20"
            cy="76"
            r="1.5"
            fill="currentColor"
            className="text-primary/20 animate-trail-2"
          />
          <circle
            cx="10"
            cy="74"
            r="1"
            fill="currentColor"
            className="text-primary/20 animate-trail-3"
          />
        </svg>

        {/* Ground line - subtle */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {text && (
        <p
          className={cn(
            "text-muted-foreground font-light tracking-wide animate-soft-pulse",
            textSizes[size]
          )}
        >
          {text}
        </p>
      )}

      <style jsx>{`
        @keyframes bodyBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        @keyframes headNod {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-1deg);
          }
          75% {
            transform: rotate(1deg);
          }
        }

        @keyframes earTwitch {
          0%,
          100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-3deg);
          }
          75% {
            transform: rotate(3deg);
          }
        }

        @keyframes gentleBlink {
          0%,
          45%,
          55%,
          100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.1);
          }
        }

        @keyframes legMovement {
          0%,
          100% {
            transform: translateY(0);
          }
          25% {
            transform: translateY(-3px);
          }
          75% {
            transform: translateY(3px);
          }
        }

        @keyframes tailSway {
          0%,
          100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }

        @keyframes whiskerMove {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-1px);
          }
          75% {
            transform: translateX(1px);
          }
        }

        @keyframes trailFade {
          0% {
            opacity: 0;
            transform: translateX(0) scale(1);
          }
          50% {
            opacity: 0.3;
            transform: translateX(-10px) scale(0.8);
          }
          100% {
            opacity: 0;
            transform: translateX(-20px) scale(0.5);
          }
        }

        @keyframes softPulse {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
        }

        .animate-body-bounce {
          animation: bodyBounce 0.8s ease-in-out infinite;
        }

        .animate-head-nod {
          animation: headNod 1.2s ease-in-out infinite;
          transform-origin: 50px 38px;
        }

        .animate-ear-twitch {
          animation: earTwitch 0.6s ease-in-out infinite;
          transform-origin: 50px 20px;
        }

        .animate-gentle-blink {
          animation: gentleBlink 3s infinite;
        }

        .animate-legs {
          animation: legMovement 0.6s ease-in-out infinite;
        }

        .leg-fl {
          animation: legMovement 0.6s ease-in-out infinite;
          animation-delay: 0.1s;
        }

        .leg-fr {
          animation: legMovement 0.6s ease-in-out infinite;
          animation-delay: 0.3s;
        }

        .leg-bl {
          animation: legMovement 0.6s ease-in-out infinite;
          animation-delay: 0.2s;
        }

        .leg-br {
          animation: legMovement 0.6s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        .paw-left {
          animation: legMovement 0.6s ease-in-out infinite;
          animation-delay: 0.1s;
        }

        .paw-right {
          animation: legMovement 0.6s ease-in-out infinite;
          animation-delay: 0.3s;
        }

        .animate-tail-sway {
          animation: tailSway 0.8s ease-in-out infinite;
          transform-origin: 78px 60px;
        }

        .animate-whisker {
          animation: whiskerMove 1s ease-in-out infinite;
        }

        .animate-trail-1 {
          animation: trailFade 1.2s ease-out infinite;
        }

        .animate-trail-2 {
          animation: trailFade 1.2s ease-out infinite;
          animation-delay: 0.2s;
        }

        .animate-trail-3 {
          animation: trailFade 1.2s ease-out infinite;
          animation-delay: 0.4s;
        }

        .animate-soft-pulse {
          animation: softPulse 2s ease-in-out infinite;
        }

        .animate-smile {
          animation: softPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
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
