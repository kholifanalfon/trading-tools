"use client";

import * as React from "react";

import { NavMain } from "@/shared/components/nav-main";
import { NavUser } from "@/shared/components/nav-user";
import { TeamSwitcher } from "@/shared/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  UserIcon,
  TrendingUpIcon,
  SettingsIcon,
  HistoryIcon,
} from "lucide-react";

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

  const sidebarUser = {
    name: user?.fullName || "Guest User",
    email: user?.email || "guest@example.com",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar8.jpg",
  };

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
          title: "Settings",
          url: "/settings",
          icon: <SettingsIcon />,
        },
      ],
    });
  }




  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {navMain.length > 0 && <NavMain items={navMain} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
