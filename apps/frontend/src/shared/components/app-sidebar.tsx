"use client";

import * as React from "react";

import { NavMain } from "@/shared/components/nav-main";
import { TeamSwitcher } from "@/shared/components/team-switcher";
import { usePwa } from "@/shared/providers/pwa-provider";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/shared/components/ui/sidebar";
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, UserIcon, TrendingUpIcon, SettingsIcon, HistoryIcon, LineChartIcon, BriefcaseIcon, BookOpenIcon } from "lucide-react";

import { useAuthStore } from "@/shared/stores/auth.store";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user);

  const navMain = [];
  if (user?.role === "admin") {
    navMain.push({
      title: "Master",
      items: [
        {
          title: "User Management",
          url: "/user-management",
          icon: <UserIcon />,
        },
        {
          title: "Stock Management",
          url: "/stocks",
          icon: <TrendingUpIcon />,
        },
        {
          title: "Stock Screener",
          url: "/screener",
          icon: <TrendingUpIcon />,
        },
        {
          title: "Live Screener",
          url: "/live-screener",
          icon: <TrendingUpIcon />,
        },
        {
          title: "Ingestion Logs",
          url: "/ingestion-logs",
          icon: <HistoryIcon />,
        },
        {
          title: "AI Backtesting",
          url: "/backtest",
          icon: <LineChartIcon />,
        },
        {
          title: "Settings",
          url: "/settings",
          icon: <SettingsIcon />,
        },
      ],
    });
  }

  // Trading Tools section accessible to all authenticated users
  navMain.push({
    title: "Trading Tools",
    items: [
      {
        title: "Portfolios",
        url: "/portfolios",
        icon: <BriefcaseIcon />,
      },
      {
        title: "Trading Journal",
        url: "/journals",
        icon: <BookOpenIcon />,
      },
    ],
  });


  const { state } = useSidebar();
  const { needRefresh, updateServiceWorker } = usePwa();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>{navMain.length > 0 && <NavMain items={navMain} />}</SidebarContent>
      <SidebarFooter>
        {state === "expanded" &&
          (needRefresh ? (
            <button
              onClick={() => updateServiceWorker(true)}
              className="mx-3 my-2 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-2 rounded-md transition duration-150 animate-pulse text-center"
            >
              Update to New Version
            </button>
          ) : (
            <div className="px-3 py-2 text-[10px] text-muted-foreground/50 font-mono text-center select-none border-t border-sidebar-border/30 mt-1">v{__APP_VERSION__}</div>
          ))}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
