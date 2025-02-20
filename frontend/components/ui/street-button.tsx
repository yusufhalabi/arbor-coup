import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface StreetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const StreetButton = React.forwardRef<HTMLButtonElement, StreetButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <div className="relative inline-block">
        {/* Button with street sign styling */}
        <Button
          className={cn(
            "bg-streetGreen text-white hover:bg-streetGreen/90 text-xl font-roadway tracking-looser",
            className
          )}
          variant={variant}
          size={size}
          ref={ref}
          {...props}
        />
        
        {/* Street Sign Pole */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="w-2 h-20 bg-zinc-700" /> {/* Main pole */}
        </div>
      </div>
    );
  }
);
StreetButton.displayName = "StreetButton";

export { StreetButton };
