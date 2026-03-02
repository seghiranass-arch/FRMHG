import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "secondary" | "destructive" | "default";
  size?: "default" | "sm" | "lg" | "icon";
};

export function Button({ className = "", variant = "primary", size = "default", ...props }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 disabled:opacity-50 disabled:pointer-events-none";

  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
    icon: "h-9 w-9"
  };

  const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-brand-primary text-white shadow-[0_10px_30px_-15px_rgba(27,84,72,0.75)] hover:bg-brand-primary/95",
    default:
      "bg-brand-primary text-white shadow-[0_10px_30px_-15px_rgba(27,84,72,0.75)] hover:bg-brand-primary/95",
    ghost: "bg-white/0 text-brand-primary hover:bg-brand-primary/10",
    outline: "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
  };

  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}
