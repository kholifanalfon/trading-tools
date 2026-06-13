import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "@/shared/stores/auth.store";
import { InfoLandingPage } from "./features/info/pages/info-landing.page";
import { ProfilePage } from "./features/profile/pages/profile.page";
import { AuthLoginPage } from "./features/auth/pages/auth-login.page";
import { AuthRegisterPage } from "./features/auth/pages/auth-register.page";
import { UserManagementListPage } from "./features/user-management/pages/user-management-list.page";
import { StockListPage } from "./features/stocks/pages/stock-list.page";
import { ThemeProvider } from "./shared/components/theme-provider";
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

const queryClient = new QueryClient();

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              {/* Auth Layout Wrapper */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<AuthLoginPage />} />
                <Route path="/register" element={<AuthRegisterPage />} />
              </Route>

              {/* Platform Sidebar Layout Wrapper */}
              <Route element={<PlatformLayout />}>
                <Route path="/" element={<InfoLandingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/user-management" element={<UserManagementListPage />} />
                <Route path="/stocks" element={<StockListPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <GlobalErrorContainer />
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
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
  const { isAuthenticated, isLoading, user, checkAuth, logout } = useAuthStore();

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
  } else if (location.pathname === "/dashboard") {
    pageName = "Dashboard";
  } else if (location.pathname === "/orders") {
    pageName = "Orders";
  }

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
                  window.location.href = "/login";
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
        <main className="flex-1 bg-background p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
export default App;
