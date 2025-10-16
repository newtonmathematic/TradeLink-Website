import { ReactNode, useMemo } from "react";

import { cn } from "@/lib/utils";

import "./GradientText.css";

export type GradientTextProps = {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
};

export default function GradientText({
  children,
  className = "",
  colors = ["#8b36ea", "#4079ff", "#750ced", "#4079ff", "#8b36ea"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = useMemo(
    () => ({
      backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
      animationDuration: `${animationSpeed}s`,
    }),
    [colors, animationSpeed]
  );

  return (
    <span className={cn("animated-gradient-text", className)}>
      {showBorder && (
        <span className="gradient-overlay" style={gradientStyle} aria-hidden />
      )}
      <span className="text-content" style={gradientStyle}>
        {children}
      </span>
    </span>
  );
}
