"use client";

import * as React from "react";

import type { AuthUser } from "../../lib/auth";
import { Backdrop } from "./backdrop";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function ShellInner({ children, user }: { children: React.ReactNode; user: AuthUser }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  
  // Calculate margin based on sidebar state
  // When sidebar is expanded or hovered, it takes up 290px
  // When collapsed, it takes up 90px
  // On mobile, the sidebar is an overlay, so no margin is needed
  const mainContentMargin = React.useMemo(() => {
    if (isMobileOpen) return "ml-0";
    if (isExpanded || isHovered) return "lg:ml-[290px]";
    return "lg:ml-[90px]";
  }, [isMobileOpen, isExpanded, isHovered]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppSidebar user={user} />
      <Backdrop />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader user={user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminShell({ children, user }: { children: React.ReactNode; user: AuthUser }) {
  return (
    <SidebarProvider>
      <ShellInner user={user}>{children}</ShellInner>
    </SidebarProvider>
  );
}








