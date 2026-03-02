"use client";

import * as React from "react";

import { useSidebar } from "./sidebar-context";

export function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  if (!isMobileOpen) return null;

  return <div className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" onClick={toggleMobileSidebar} />;
}








