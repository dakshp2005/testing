import React from "react";
import { cn } from "../../lib/utils";

interface GradientTextProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

export function GradientText({
  className,
  children,
  as: Component = "span",
  ...props
}: GradientTextProps) {
  return (
    <Component
      className={cn(
        "animated-gradient-text",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}