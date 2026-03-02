import { HTMLAttributes, forwardRef } from "react";

interface AnimatedCardOwnProps {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  hoverable?: boolean;
  animated?: boolean;
}

interface AnimatedCardProps extends AnimatedCardOwnProps, HTMLAttributes<HTMLDivElement> {}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ 
    children, 
    variant = "default", 
    hoverable = true, 
    animated = true,
    className = "",
    ...props 
  }, ref) => {
    const baseClasses = "rounded-lg border bg-white shadow-sm transition-all duration-300";
    
    const variantClasses = {
      default: "border-gray-200",
      primary: "border-blue-200 bg-blue-50",
      secondary: "border-gray-200 bg-gray-50",
      success: "border-green-200 bg-green-50",
      warning: "border-yellow-200 bg-yellow-50",
      danger: "border-red-200 bg-red-50",
    };
    
    const hoverClasses = hoverable 
      ? "hover:shadow-md hover:-translate-y-0.5" 
      : "";
      
    const animationClasses = animated 
      ? "motion-safe:animate-fade-in-up" 
      : "";
    
    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${animationClasses} ${className}`;
    
    return (
      <div 
        ref={ref}
        className={combinedClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";