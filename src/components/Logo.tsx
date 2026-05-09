import React from "react";
import { Zap, FileText } from "lucide-react";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ className, size = "md" }) => {
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center bg-black rounded-xl shadow-lg border border-white/10",
      sizeClasses[size],
      className
    )}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-white/5 rounded-xl opacity-50"></div>
      
      {/* Document Icon */}
      <div className="relative z-10 text-white">
        <FileText className={iconSizes[size]} strokeWidth={1.5} />
      </div>

      {/* Lightning Bolt Circle */}
      <div className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-900 border border-black shadow-md",
        size === "xs" ? "w-2.5 h-2.5" : size === "sm" ? "w-3 h-3" : "w-4 h-4"
      )}>
        <Zap className={cn("text-white fill-white", size === "xs" || size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")} />
      </div>

      {/* PRO Badge */}
      {size !== "xs" && (
        <div className={cn(
          "absolute -bottom-1 -right-0.5 px-1 rounded-sm bg-red-600 text-[6px] font-bold text-white uppercase tracking-tighter",
          size === "sm" ? "scale-[0.8]" : ""
        )}>
          PRO
        </div>
      )}
    </div>
  );
};
