"use client";

import * as React from "react";

type DropdownProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function Dropdown({ isOpen, onClose, children, className = "" }: DropdownProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".dropdown-toggle")
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute right-0 z-40 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg ${className}`}
    >
      {children}
    </div>
  );
}








