import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Outlet,
  Navigate,
  Link,
} from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { InfoLandingPage } from "./features/info/pages/info-landing.page";
import { ProfilePage } from "./features/profile/pages/profile.page";
import { AuthLoginPage } from "./features/auth/pages/auth-login.page";
import { AuthRegisterPage } from "./features/auth/pages/auth-register.page";
import { UserManagementListPage } from "./features/user-management/pages/user-management-list.page";
import { StockListPage } from "./features/stocks/pages/stock-list.page";
import { SettingsPage } from "./features/settings/pages/settings.page";
import { ScreenerPage } from "./features/screener/pages/screener.page";
import { LiveScreenerPage } from "./features/live-screener/pages/live-screener.page";
import { IngestionLogsPage } from "./features/screener/pages/ingestion-logs.page";
import { StockDetailPage } from "./features/screener/pages/stock-detail.page";
import { BacktestPage } from "./features/backtest/pages/backtest.page";
import { ThemeProvider } from "./shared/components/theme-provider";
import { HomeIcon, TrendingUpIcon, ActivityIcon, CpuIcon, SettingsIcon } from "lucide-react";


import { ThemeToggle } from "./shared/components/ui/theme-toggle";
import { TooltipProvider } from "./shared/components/ui/tooltip";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "./shared/components/ui/sidebar";
import { AppSidebar } from "./shared/components/app-sidebar";
import { Separator } from "./shared/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "./shared/components/ui/breadcrumb";

import { GlobalErrorContainer } from "./shared/components/global-error-container";
import { Toaster } from "@/shared/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/shared/hooks/use-websocket";
import { stocksKeys } from "./features/stocks/stocks.keys";
import { toast } from "sonner";
import { WebSocketProvider } from "@/shared/providers/websocket-provider";

import { PwaProvider } from "@/shared/providers/pwa-provider";

const queryClient = new QueryClient();

export function App() {
  return (
    <PwaProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter
              basename={import.meta.env.FE_BASE_URL || "/"}
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              <Routes>
                {/* Auth Layout Wrapper */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<AuthLoginPage />} />
                  <Route path="/register" element={<AuthRegisterPage />} />
                </Route>

                {/* Platform Sidebar Layout Wrapper */}
                <Route
                  element={
                    <WebSocketProvider>
                      <PlatformLayout />
                    </WebSocketProvider>
                  }
                >
                  <Route path="/" element={<InfoLandingPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/user-management" element={<UserManagementListPage />} />
                  <Route path="/stocks" element={<StockListPage />} />
                  <Route path="/screener" element={<ScreenerPage />} />
                  <Route path="/live-screener" element={<LiveScreenerPage />} />
                  <Route path="/backtest" element={<BacktestPage />} />
                  <Route path="/screener/:symbol" element={<StockDetailPage />} />
                  <Route path="/ingestion-logs" element={<IngestionLogsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                </Route>
              </Routes>
            </BrowserRouter>
            <GlobalErrorContainer />
            <Toaster />
          </QueryClientProvider>
        </TooltipProvider>
      </ThemeProvider>
    </PwaProvider>
  );
}


function AuthLayout() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      <main className="flex-1 bg-background">
        <Outlet />
      </main>
    </div>
  );
}

function PlatformLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, checkAuth, logout } = useAuthStore();
  const queryClient = useQueryClient();

  // Listen to sync status updates in real-time via WebSockets globally
  useWebSocket(["stocks", "sync-status"], (data) => {
    if (data.status === "success") {
      toast.success("Stock synchronization completed successfully!");
      queryClient.invalidateQueries({ queryKey: stocksKeys.lists() });
    } else if (data.status === "failed") {
      toast.error(`Stock synchronization failed: ${data.error || "Unknown error"}`);
    }
  });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Dynamic breadcrumb page name based on route path
  let pageName = "Tech Stack";
  if (location.pathname === "/profile") {
    pageName = "Profile";
  } else if (location.pathname === "/user-management") {
    pageName = "User Management";
  } else if (location.pathname === "/stocks") {
    pageName = "Stock Management";
  } else if (location.pathname === "/screener") {
    pageName = "Stock Screener";
  } else if (location.pathname === "/live-screener") {
    pageName = "Live Screener";
  } else if (location.pathname === "/backtest") {
    pageName = "AI Backtesting";
  } else if (location.pathname.startsWith("/screener/")) {
    pageName = "Stock Detail";
  } else if (location.pathname === "/ingestion-logs") {
    pageName = "Ingestion Logs";
  } else if (location.pathname === "/settings") {
    pageName = "Settings";

  } else if (location.pathname === "/dashboard") {
    pageName = "Dashboard";
  } else if (location.pathname === "/orders") {
    pageName = "Orders";
  }



  const mobileNavItems = [
    { label: "Home", path: "/", icon: <HomeIcon className="h-5 w-5" /> },
    { label: "Screener", path: "/screener", icon: <TrendingUpIcon className="h-5 w-5" /> },
    { label: "Live", path: "/live-screener", icon: <ActivityIcon className="h-5 w-5" /> },
    { label: "Backtest", path: "/backtest", icon: <CpuIcon className="h-5 w-5" /> },
    { label: "Settings", path: "/settings", icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header adapted to sidebar-07 */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Platform</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Logged in as <strong className="text-foreground">{user?.fullName}</strong>
            </span>
            <button
              onClick={async () => {
                try {
                  await logout();
                  navigate("/login");
                } catch (err) {
                  console.error("Logout failed:", err);
                }
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition font-medium"
            >
              Sign Out
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-background p-6 pb-20 md:pb-6 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Tabs */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/90 backdrop-blur-lg border-t border-border/60 py-2 px-2 flex items-center justify-around shadow-lg pb-safe">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all ${
                  isActive ? "text-indigo-400 font-bold scale-105" : "text-muted-foreground hover:text-foreground hover:scale-105"
                }`}
              >
                {item.icon}
                <span className="text-[9px] tracking-wide font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
export default App;
