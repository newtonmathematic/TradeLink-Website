import React from "react";
import { cn } from "@/lib/utils";
import "./ShinyText.css";

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const clampDuration = (speed: number) => {
  if (Number.isNaN(speed) || !Number.isFinite(speed)) {
    return 5;
  }

  return Math.max(0.1, speed);
};

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className,
}) => {
  const animationDuration = `${clampDuration(speed)}s`;

  return (
    <span
      className={cn("shiny-text", { disabled }, className)}
      style={{ animationDuration }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
