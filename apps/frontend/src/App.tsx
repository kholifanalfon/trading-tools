import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";
import { InfoLandingPage } from "./features/info/pages/info-landing.page";
import { ProfilePage } from "./features/profile/pages/profile.page";
import { AuthLoginPage } from "./features/auth/pages/auth-login.page";
import { AuthRegisterPage } from "./features/auth/pages/auth-register.page";
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
              </Route>
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

function AuthLayout() {
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

  // Dynamic breadcrumb page name based on route path
  let pageName = "Tech Stack";
  if (location.pathname === "/profile") {
    pageName = "Profile";
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
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition font-medium"
            >
              Sign In
            </Link>
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
