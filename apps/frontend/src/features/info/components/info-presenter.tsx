import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { TechStackInfo } from "../types/info.types";

export interface InfoPresenterProps {
  backendStack: TechStackInfo | undefined;
  isLoading: boolean;
  error: unknown;
  frontendStack: Array<{ name: string; desc: string; type: string }>;
}

export function InfoPresenter({
  backendStack,
  isLoading,
  error,
  frontendStack,
}: InfoPresenterProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-6xl mx-auto px-6 py-20">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="indigo" className="px-3 py-1 font-mono tracking-wider">
            ARCHITECTURE SPECIFICATION
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            System Tech Stack
          </h1>
          <p className="max-w-xl mx-auto text-muted-foreground text-sm sm:text-base">
            An overview of the client and server technologies utilized within this workspace environment.
          </p>
        </div>

        {/* Connection Status Indicator */}
        <div className="flex justify-center mb-16">
          <div className="flex items-center gap-3 px-4 py-2 rounded-md border border-border bg-card shadow-sm">
            <span className="text-xs text-muted-foreground font-medium">Backend Connection:</span>
            {isLoading ? (
              <div className="flex items-center gap-2 text-yellow-500 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                Connecting...
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-destructive text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-destructive"></span>
                Offline
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </div>
            )}
          </div>
        </div>

        {/* Stack Grid - Shadcn Default Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Frontend Stack Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-indigo-400 font-mono">01.</span> Frontend Application
              </CardTitle>
              <Badge variant="indigo">
                React + Vite
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="divide-y divide-border">
                {frontendStack.map((tech) => (
                  <div key={tech.name} className="py-4 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <h3 className="font-semibold text-foreground">{tech.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{tech.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border font-mono whitespace-nowrap">
                      {tech.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Backend Stack Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-border">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="text-emerald-400 font-mono">02.</span> Backend Module
              </CardTitle>
              <Badge variant="emerald">
                Express + Bun
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4 py-16 flex flex-col items-center justify-center text-muted-foreground text-sm">
                  <div className="rounded-full h-6 w-6 border-2 border-border border-t-emerald-500 animate-spin"></div>
                  <span>Fetching stack configurations...</span>
                </div>
              ) : error ? (
                <div className="py-12 px-6 border border-destructive/20 bg-destructive/10 text-center space-y-2 rounded-md">
                  <p className="text-sm font-semibold text-destructive">Failed to connect to backend server</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Ensure the backend Express service is active on your host port (default: 3000).
                  </p>
                </div>
              ) : backendStack ? (
                <div className="divide-y divide-border">
                  <div className="py-4 flex items-start justify-between gap-4 first:pt-0">
                    <div>
                      <h3 className="font-semibold text-foreground">Runtime Engine</h3>
                      <p className="text-xs text-muted-foreground mt-1">High-performance JavaScript runtime</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md font-mono">
                      {backendStack.runtime}
                    </span>
                  </div>

                  <div className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">HTTP Framework</h3>
                      <p className="text-xs text-muted-foreground mt-1">Minimalist and flexible routing layer</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md font-mono">
                      {backendStack.framework}
                    </span>
                  </div>

                  <div className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Database ORM</h3>
                      <p className="text-xs text-muted-foreground mt-1">Type-safe SQL queries</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md font-mono">
                      {backendStack.orm}
                    </span>
                  </div>

                  <div className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Primary Database</h3>
                      <p className="text-xs text-muted-foreground mt-1">Relational database and connection layer</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md font-mono">
                      {backendStack.database}
                    </span>
                  </div>

                  <div className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Structured Logger</h3>
                      <p className="text-xs text-muted-foreground mt-1">Performance-focused logger</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md font-mono">
                      {backendStack.logger}
                    </span>
                  </div>

                  <div className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Input Validation</h3>
                      <p className="text-xs text-muted-foreground mt-1">TypeScript-first schema validation</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md font-mono">
                      {backendStack.validation}
                    </span>
                  </div>

                  <div className="py-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Authentication</h3>
                      <p className="text-xs text-muted-foreground mt-1">JWT payload sign, verify, and encryption</p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md font-mono">
                      {backendStack.auth}
                    </span>
                  </div>

                  {backendStack.version && (
                    <div className="py-4 flex items-start justify-between gap-4 last:pb-0">
                      <div>
                        <h3 className="font-semibold text-foreground">API Version</h3>
                        <p className="text-xs text-muted-foreground mt-1">Current active endpoint version</p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted border border-border px-2.5 py-1 rounded-md font-mono">
                        {backendStack.version}
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

