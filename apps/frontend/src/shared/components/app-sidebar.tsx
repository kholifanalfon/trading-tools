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
  UsersIcon,
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
      title: "User Management",
      url: "/user-management",
      icon: <UsersIcon />,
      isActive: true,
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
