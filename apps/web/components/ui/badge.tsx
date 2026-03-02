import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  let variantStyles = "";
  if (variant === "default") {
    variantStyles = "border-transparent bg-brand-primary text-white hover:bg-brand-primary/80";
  } else if (variant === "secondary") {
    variantStyles = "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200";
  } else if (variant === "destructive") {
    variantStyles = "border-transparent bg-red-500 text-white hover:bg-red-600";
  } else if (variant === "outline") {
    variantStyles = "text-gray-900 border-gray-200";
  }

  return (
    <div className={`${base} ${variantStyles} ${className}`} {...props} />
  );
}
