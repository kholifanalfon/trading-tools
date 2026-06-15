# Graph Report - .  (2026-06-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1221 nodes · 2196 edges · 89 communities (76 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `609cce90`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend Components & Screener UI|Frontend Components & Screener UI]]
- [[_COMMUNITY_Auth Schemas & Auth Services|Auth Schemas & Auth Services]]
- [[_COMMUNITY_Screener Providers & API Adapters|Screener Providers & API Adapters]]
- [[_COMMUNITY_Backend Package & Express Middleware Dependencies|Backend Package & Express Middleware Dependencies]]
- [[_COMMUNITY_React UI Hook Utils & File Upload|React UI Hook Utils & File Upload]]
- [[_COMMUNITY_Backend Core Config & Error Handlers|Backend Core Config & Error Handlers]]
- [[_COMMUNITY_Docusaurus Documentation Site Packages|Docusaurus Documentation Site Packages]]
- [[_COMMUNITY_Monorepo Package Configuration|Monorepo Package Configuration]]
- [[_COMMUNITY_User Management Components & Hooks|User Management Components & Hooks]]
- [[_COMMUNITY_Vibe UI Primitive Component Elements|Vibe UI Primitive Component Elements]]
- [[_COMMUNITY_React Module|React Module]]
- [[_COMMUNITY_Types Module|Types Module]]
- [[_COMMUNITY_Sheet Module|Sheet Module]]
- [[_COMMUNITY_Settings Module|Settings Module]]
- [[_COMMUNITY_Components Module|Components Module]]
- [[_COMMUNITY_Error Module|Error Module]]
- [[_COMMUNITY_Paths Module|Paths Module]]
- [[_COMMUNITY_App Module|App Module]]
- [[_COMMUNITY_Getstockbyid Module|Getstockbyid Module]]
- [[_COMMUNITY_Repository Module|Repository Module]]
- [[_COMMUNITY_Erasablesyntaxonly Module|Erasablesyntaxonly Module]]
- [[_COMMUNITY_Schema Module|Schema Module]]
- [[_COMMUNITY_Dropdownmenulabel Module|Dropdownmenulabel Module]]
- [[_COMMUNITY_Erasablesyntaxonly Module|Erasablesyntaxonly Module]]
- [[_COMMUNITY_Paths Module|Paths Module]]
- [[_COMMUNITY_React Module|React Module]]
- [[_COMMUNITY_Getusers Module|Getusers Module]]
- [[_COMMUNITY_Popover Module|Popover Module]]
- [[_COMMUNITY_Api Module|Api Module]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Canvas Module|Canvas Module]]
- [[_COMMUNITY_Getsettings Module|Getsettings Module]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Sidebar Module|Sidebar Module]]
- [[_COMMUNITY_Typename Module|Typename Module]]
- [[_COMMUNITY_Collapsible Module|Collapsible Module]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Homepagefeatures Module|Homepagefeatures Module]]
- [[_COMMUNITY_Authrepository Module|Authrepository Module]]
- [[_COMMUNITY_Usermanagementroutes Module|Usermanagementroutes Module]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Preview Module|Preview Module]]
- [[_COMMUNITY_Filepath Module|Filepath Module]]
- [[_COMMUNITY_Fail Module|Fail Module]]
- [[_COMMUNITY_Version Module|Version Module]]
- [[_COMMUNITY_Baseurl Module|Baseurl Module]]
- [[_COMMUNITY_Getallsettings Module|Getallsettings Module]]
- [[_COMMUNITY_Login Module|Login Module]]
- [[_COMMUNITY_Runseeders Module|Runseeders Module]]
- [[_COMMUNITY_Importmeta Module|Importmeta Module]]
- [[_COMMUNITY_Entrypoint Module|Entrypoint Module]]
- [[_COMMUNITY_Themes Module|Themes Module]]
- [[_COMMUNITY_Cn Module|Cn Module]]
- [[_COMMUNITY_String Module|String Module]]
- [[_COMMUNITY_Config Module|Config Module]]
- [[_COMMUNITY_Generate Module|Generate Module]]
- [[_COMMUNITY_Introspect Module|Introspect Module]]
- [[_COMMUNITY_Migrate Module|Migrate Module]]
- [[_COMMUNITY_Refresh Module|Refresh Module]]
- [[_COMMUNITY_Config Module|Config Module]]
- [[_COMMUNITY_Sidebars Module|Sidebars Module]]
- [[_COMMUNITY_Config Module|Config Module]]
- [[_COMMUNITY_Config Module|Config Module]]
- [[_COMMUNITY_Config Module|Config Module]]
- [[_COMMUNITY_Config Module|Config Module]]
- [[_COMMUNITY_Exchanges Module|Exchanges Module]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 88|Community 88]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 100 edges
2. `Button` - 23 edges
3. `ApiError` - 22 edges
4. `compilerOptions` - 18 edges
5. `scripts` - 18 edges
6. `compilerOptions` - 17 edges
7. `AppError` - 16 edges
8. `compilerOptions` - 16 edges
9. `ScreenerService` - 13 edges
10. `compilerOptions` - 13 edges

## Surprising Connections (you probably didn't know these)
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/breadcrumb.tsx → apps/frontend/src/shared/utils/cn.ts
- `SheetFooter()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/sheet.tsx → apps/frontend/src/shared/utils/cn.ts
- `SidebarInput()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/sidebar.tsx → apps/frontend/src/shared/utils/cn.ts
- `SidebarSeparator()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/sidebar.tsx → apps/frontend/src/shared/utils/cn.ts
- `SidebarGroupAction()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/sidebar.tsx → apps/frontend/src/shared/utils/cn.ts

## Import Cycles
- None detected.

## Communities (89 total, 13 thin omitted)

### Community 0 - "Frontend Components & Screener UI"
Cohesion: 0.05
Nodes (70): LoginInput, RegisterInput, LoginSchema, RegisterSchema, LoginForm(), RegisterForm(), RegisterFormProps, ScreenerResultsProps (+62 more)

### Community 1 - "Auth Schemas & Auth Services"
Cohesion: 0.05
Nodes (52): LoginFormProps, QuoteDetailsProps, StrategyScoreCard(), StrategyScoreCardProps, api, ApiError, WebSocketError, useGetQuote() (+44 more)

### Community 2 - "Screener Providers & API Adapters"
Cohesion: 0.06
Nodes (37): FinnhubAdapter, YahooFinanceAdapter, getFinnhubClient(), yahooFinance, FinnhubError, ScreenerController, controller, router (+29 more)

### Community 3 - "Backend Package & Express Middleware Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, cookie-parser, cors, csrf-csrf, dotenv, drizzle-orm, express, express-rate-limit (+35 more)

### Community 4 - "React UI Hook Utils & File Upload"
Cohesion: 0.08
Nodes (37): useAsRef(), useLazyRef(), Direction, FileState, FileUpload(), FileUploadClear(), FileUploadClearProps, FileUploadContext (+29 more)

### Community 5 - "Backend Core Config & Error Handlers"
Cohesion: 0.09
Nodes (29): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Calendar(), CalendarDayButton() (+21 more)

### Community 6 - "Docusaurus Documentation Site Packages"
Cohesion: 0.06
Nodes (32): browserslist, development, production, dependencies, clsx, @docusaurus/core, @docusaurus/preset-classic, @mdx-js/react (+24 more)

### Community 7 - "Monorepo Package Configuration"
Cohesion: 0.06
Nodes (31): dependencies, dotenv, postgres, devDependencies, @types/node, typescript, name, overrides (+23 more)

### Community 8 - "User Management Components & Hooks"
Cohesion: 0.16
Nodes (21): StockFormDialogProps, StockTableProps, useCreateStock(), useDeleteStock(), useGetStocks(), useSyncStock(), useUpdateStock(), StockListPage() (+13 more)

### Community 9 - "Vibe UI Primitive Component Elements"
Cohesion: 0.10
Nodes (24): useIsMobile(), Collapsible(), CollapsibleContent(), CollapsibleTrigger(), SidebarContext, SidebarContextProps, SidebarGroup(), SidebarGroupAction() (+16 more)

### Community 10 - "React Module"
Cohesion: 0.08
Nodes (26): dependencies, axios, class-variance-authority, clsx, date-fns, @fontsource-variable/geist, @hookform/resolvers, lightweight-charts (+18 more)

### Community 11 - "Types Module"
Cohesion: 0.20
Nodes (15): UserTable(), useCreateUser(), useDeleteUser(), useGetUsers(), useUpdateUser(), UserManagementListPage(), createUserApi(), deleteUserApi() (+7 more)

### Community 12 - "Sheet Module"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 13 - "Settings Module"
Cohesion: 0.14
Nodes (17): AppSidebar(), AuthLayout(), PlatformLayout(), queryClient, useAuthStore, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem() (+9 more)

### Community 14 - "Components Module"
Cohesion: 0.14
Nodes (13): EnvConfig, envSchema, parsed, corsMiddleware, csrfProtection(), { doubleCsrfProtection, generateCsrfToken }, navigationBlocker(), Request (+5 more)

### Community 15 - "Error Module"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 16 - "Paths Module"
Cohesion: 0.11
Nodes (18): 1. Architecture, 2. File Naming, 3. Code-Level Casing, 4. Design Pattern, 5. Layer Boundaries & Rules, 6. Testing — Backend, Alur Request (Request Lifecycle), Backend Guidelines (+10 more)

### Community 17 - "App Module"
Cohesion: 0.19
Nodes (8): db, queryClient, NewSetting, Setting, settings, NewUser, User, users

### Community 18 - "Getstockbyid Module"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 19 - "Repository Module"
Cohesion: 0.15
Nodes (9): NewStockData, StockData, NewStockLog, StockLog, stockLogs, NewStock, Stock, stocks (+1 more)

### Community 20 - "Erasablesyntaxonly Module"
Cohesion: 0.13
Nodes (6): StocksRepository, CreateStockInput, StockQueryInput, SyncState, UpdateStockInput, StocksService

### Community 21 - "Schema Module"
Cohesion: 0.11
Nodes (18): 1.1 Membuat Fitur Frontend Baru, 1.2 Membuat Modul Backend Baru, 1.3 Membuat Migration Database, 1.4 Membuat Migration Generator (Custom), 1.5 Membuat & Menjalankan Seeder, 1.6 Menambah Environment Variable, 1. Code Generation Workflow, 2.1 Checklist Sebelum Selesai (+10 more)

### Community 22 - "Dropdownmenulabel Module"
Cohesion: 0.27
Nodes (11): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuTrigger() (+3 more)

### Community 23 - "Erasablesyntaxonly Module"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 24 - "Paths Module"
Cohesion: 0.19
Nodes (5): UserManagementRepository, CreateUserInput, UpdateUserInput, UserQueryInput, UserManagementService

### Community 25 - "React Module"
Cohesion: 0.11
Nodes (17): 1.1 Membuat Fitur Frontend Baru, 1.2 Membuat Modul Backend Baru, 1.3 Membuat Migration Database, 1.5 Membuat & Menjalankan Seeder, 1.6 Menambah Environment Variable, 1. Code Generation Workflow, 2.1 Checklist Sebelum Selesai, 2.2 Perintah Verifikasi (+9 more)

### Community 26 - "Getusers Module"
Cohesion: 0.12
Nodes (16): 1. Tech Stack, 2. Monorepo Structure, 3. Environment Configuration, 4. Database CLI Commands, 5. Branching & Git Workflow, 6. CI/CD (GitHub Actions), Alur Pengembangan Fitur (Git Flow), Backend (Express + Bun) (+8 more)

### Community 27 - "Popover Module"
Cohesion: 0.12
Nodes (16): 1. Tech Stack, 2. Monorepo Structure, 3. Environment Configuration, 4. Database CLI Commands, 5. Branching & Git Workflow, 6. CI/CD (GitHub Actions), Alur Pengembangan Fitur (Git Flow), Backend (Express + Bun) (+8 more)

### Community 28 - "Api Module"
Cohesion: 0.17
Nodes (7): SettingsRepository, UpdateSettingsInput, UpdateSettingsSchema, MASTER_EXCHANGES, SettingsService, encrypt(), SECRET_KEY

### Community 29 - "Controller Module"
Cohesion: 0.12
Nodes (15): compilerOptions, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, paths (+7 more)

### Community 30 - "Canvas Module"
Cohesion: 0.17
Nodes (8): errorHandler(), logger, ExtendedWebSocket, secret, WebSocketService, requestLogger(), sanitizeLogValue(), StocksController

### Community 31 - "Getsettings Module"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+8 more)

### Community 32 - "Controller Module"
Cohesion: 0.29
Nodes (5): AppError, DataExistError, DataNotFoundError, GeminiApiError, currentSyncState

### Community 33 - "Sidebar Module"
Cohesion: 0.24
Nodes (8): InfoPresenter(), InfoPresenterProps, useGetInfo(), infoKeys, InfoLandingPage(), fetchTechStackInfo(), triggerBackendSentryTest(), TechStackInfo

### Community 34 - "Typename Module"
Cohesion: 0.21
Nodes (10): StockChartCanvas(), StockChartCanvasProps, initialState, Theme, ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState (+2 more)

### Community 35 - "Collapsible Module"
Cohesion: 0.21
Nodes (4): AuthController, AuthRepository, AuthService, UnauthorizedError

### Community 36 - "Controller Module"
Cohesion: 0.23
Nodes (11): data, NavMain(), NavProjects(), NavUser(), TeamSwitcher(), Sidebar(), SidebarContent(), SidebarFooter() (+3 more)

### Community 37 - "Homepagefeatures Module"
Cohesion: 0.17
Nodes (11): 1. Architecture, 2. File & Folder Naming, 3. Suffix Wajib, 4. Code-Level Casing, 5. Design Patterns, 6. Path Alias, 7. Testing — Frontend, 8. Aturan QA (+3 more)

### Community 38 - "Authrepository Module"
Cohesion: 0.22
Nodes (8): LoginInput, RegisterInput, controller, router, LoginInputSchema, RegisterInputSchema, authLimiter, generalLimiter

### Community 39 - "Usermanagementroutes Module"
Cohesion: 0.25
Nodes (8): validateBody(), validateQuery(), controller, router, CreateStockSchema, StockQuerySchema, SyncStateSchema, UpdateStockSchema

### Community 40 - "Controller Module"
Cohesion: 0.18
Nodes (7): filePath, normalizedName, SCHEMA_INDEX_PATH, SCHEMAS_DIR, tableName, typeName, variableName

### Community 41 - "Preview Module"
Cohesion: 0.24
Nodes (7): requireAdmin(), authRepository, requireAuth(), secret, SettingsController, controller, router

### Community 42 - "Filepath Module"
Cohesion: 0.18
Nodes (7): Sheet(), SheetContent, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle

### Community 43 - "Fail Module"
Cohesion: 0.20
Nodes (9): 1. Architecture, 2. File Naming, 3. Code-Level Casing, 4. Design Pattern, 5. Layer Boundaries & Rules, 6. Testing — Backend, Alur Request (Request Lifecycle), Backend Guidelines (+1 more)

### Community 44 - "Version Module"
Cohesion: 0.31
Nodes (6): UserManagementController, controller, router, CreateUserSchema, UpdateUserSchema, UserQuerySchema

### Community 45 - "Baseurl Module"
Cohesion: 0.28
Nodes (6): GlobalErrorContainer(), beforeSend(), generateUUID(), ErrorState, StoredError, useErrorStore

### Community 47 - "Login Module"
Cohesion: 0.25
Nodes (7): Admonitions, Code Blocks, Front Matter, Images, Links, Markdown Features, MDX and React Components

### Community 48 - "Runseeders Module"
Cohesion: 0.29
Nodes (6): authRoutes, v1Router, screenerRoutes, settingsRoutes, stocksRoutes, userManagementRoutes

### Community 49 - "Importmeta Module"
Cohesion: 0.29
Nodes (6): Add a Locale Dropdown, Build your localized site, Configure i18n, Start your localized site, Translate a doc, Translate your site

### Community 50 - "Entrypoint Module"
Cohesion: 0.33
Nodes (5): Build, Deployment, Installation, Local Development, Website

### Community 51 - "Themes Module"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, type-check

### Community 52 - "Cn Module"
Cohesion: 0.40
Nodes (4): existingFiles, filePath, nextPrefix, SEEDERS_DIR

### Community 53 - "String Module"
Cohesion: 0.60
Nodes (3): fail(), log(), deploy.sh script

### Community 54 - "Config Module"
Cohesion: 0.40
Nodes (4): Generate a new site, Getting Started, Start your site, Tutorial Intro

### Community 55 - "Generate Module"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 56 - "Introspect Module"
Cohesion: 0.40
Nodes (4): Add a Version Dropdown, Create a docs version, Manage Docs Versions, Update an existing version

### Community 57 - "Migrate Module"
Cohesion: 0.50
Nodes (3): compilerOptions, baseUrl, extends

### Community 58 - "Refresh Module"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 59 - "Config Module"
Cohesion: 0.50
Nodes (3): Configure the Sidebar, Create a Document, Create your first Doc

### Community 60 - "Sidebars Module"
Cohesion: 0.50
Nodes (3): Create a Page, Create your first Markdown Page, Create your first React Page

## Knowledge Gaps
- **460 isolated node(s):** `name`, `version`, `private`, `main`, `dev` (+455 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `Collapsible Module` to `Frontend Components & Screener UI`?**
  _High betweenness centrality (0.177) - this node is a cross-community bridge._
- **Why does `cn()` connect `Backend Core Config & Error Handlers` to `Frontend Components & Screener UI`, `React UI Hook Utils & File Upload`, `Controller Module`, `Vibe UI Primitive Component Elements`, `Filepath Module`, `Settings Module`, `Dropdownmenulabel Module`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `SettingsProfile()` connect `Frontend Components & Screener UI` to `Backend Core Config & Error Handlers`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _460 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Components & Screener UI` be split into smaller, more focused modules?**
  _Cohesion score 0.0502814987381091 - nodes in this community are weakly interconnected._
- **Should `Auth Schemas & Auth Services` be split into smaller, more focused modules?**
  _Cohesion score 0.05112279025322503 - nodes in this community are weakly interconnected._
- **Should `Screener Providers & API Adapters` be split into smaller, more focused modules?**
  _Cohesion score 0.057971014492753624 - nodes in this community are weakly interconnected._