import * as React from "react";

export function Card({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return (
    <div
      className={`glass rounded-2xl p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset] ${className}`}
      {...props}
    />
  );
}








