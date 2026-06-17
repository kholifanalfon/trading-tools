# Graph Report - trading  (2026-06-18)

## Corpus Check
- 307 files · ~99,803 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1419 nodes · 2789 edges · 111 communities (95 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00d0af0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Frontend Components & Screener UI|Frontend Components & Screener UI]]
- [[_COMMUNITY_Auth Schemas & Auth Services|Auth Schemas & Auth Services]]
- [[_COMMUNITY_Screener Providers & API Adapters|Screener Providers & API Adapters]]
- [[_COMMUNITY_Backend Package & Express Middleware Dependencies|Backend Package & Express Middleware Dependencies]]
- [[_COMMUNITY_React UI Hook Utils & File Upload|React UI Hook Utils & File Upload]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Docusaurus Documentation Site Packages|Docusaurus Documentation Site Packages]]
- [[_COMMUNITY_Monorepo Package Configuration|Monorepo Package Configuration]]
- [[_COMMUNITY_User Management Components & Hooks|User Management Components & Hooks]]
- [[_COMMUNITY_Vibe UI Primitive Component Elements|Vibe UI Primitive Component Elements]]
- [[_COMMUNITY_React Module|React Module]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Sheet Module|Sheet Module]]
- [[_COMMUNITY_Settings Module|Settings Module]]
- [[_COMMUNITY_Components Module|Components Module]]
- [[_COMMUNITY_Error Module|Error Module]]
- [[_COMMUNITY_Paths Module|Paths Module]]
- [[_COMMUNITY_App Module|App Module]]
- [[_COMMUNITY_Getstockbyid Module|Getstockbyid Module]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Erasablesyntaxonly Module|Erasablesyntaxonly Module]]
- [[_COMMUNITY_Schema Module|Schema Module]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Erasablesyntaxonly Module|Erasablesyntaxonly Module]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_React Module|React Module]]
- [[_COMMUNITY_Getusers Module|Getusers Module]]
- [[_COMMUNITY_Popover Module|Popover Module]]
- [[_COMMUNITY_Api Module|Api Module]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Canvas Module|Canvas Module]]
- [[_COMMUNITY_Getsettings Module|Getsettings Module]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Homepagefeatures Module|Homepagefeatures Module]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Fail Module|Fail Module]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Getallsettings Module|Getallsettings Module]]
- [[_COMMUNITY_Login Module|Login Module]]
- [[_COMMUNITY_Community 48|Community 48]]
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
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 115|Community 115]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 100 edges
2. `Button` - 28 edges
3. `ApiError` - 26 edges
4. `AppError` - 18 edges
5. `compilerOptions` - 18 edges
6. `scripts` - 18 edges
7. `compilerOptions` - 17 edges
8. `runBacktestSimulation()` - 16 edges
9. `compilerOptions` - 16 edges
10. `db` - 15 edges

## Surprising Connections (you probably didn't know these)
- `CalendarDayButton()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/calendar.tsx → apps/frontend/src/shared/utils/cn.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/dialog.tsx → apps/frontend/src/shared/utils/cn.ts
- `FieldSet()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/field.tsx → apps/frontend/src/shared/utils/cn.ts
- `FieldLegend()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/field.tsx → apps/frontend/src/shared/utils/cn.ts
- `FieldContent()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/field.tsx → apps/frontend/src/shared/utils/cn.ts

## Import Cycles
- None detected.

## Communities (111 total, 16 thin omitted)

### Community 0 - "Frontend Components & Screener UI"
Cohesion: 0.16
Nodes (20): LoginFormProps, StockTable(), ApiError, useCreateStock(), useDeleteStock(), useGetStocks(), useSyncStock(), useUpdateStock() (+12 more)

### Community 1 - "Auth Schemas & Auth Services"
Cohesion: 0.17
Nodes (18): UserFormDialogProps, UserTable(), UserTableProps, useCreateUser(), useDeleteUser(), useGetUsers(), useUpdateUser(), UserManagementListPage() (+10 more)

### Community 2 - "Screener Providers & API Adapters"
Cohesion: 0.14
Nodes (12): FinnhubAdapter, YahooFinanceAdapter, getFinnhubClient(), yahooFinance, LiveStockDataQuery, CacheEntry, LiveScreenerService, StockQuote (+4 more)

### Community 3 - "Backend Package & Express Middleware Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, cookie-parser, cors, csrf-csrf, dotenv, drizzle-orm, express, express-rate-limit (+35 more)

### Community 4 - "React UI Hook Utils & File Upload"
Cohesion: 0.08
Nodes (37): useAsRef(), useLazyRef(), Direction, FileState, FileUpload(), FileUploadClear(), FileUploadClearProps, FileUploadContext (+29 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (21): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Badge(), BadgeProps (+13 more)

### Community 6 - "Docusaurus Documentation Site Packages"
Cohesion: 0.06
Nodes (32): browserslist, development, production, dependencies, clsx, @docusaurus/core, @docusaurus/preset-classic, @mdx-js/react (+24 more)

### Community 7 - "Monorepo Package Configuration"
Cohesion: 0.06
Nodes (31): dependencies, dotenv, postgres, devDependencies, @types/node, typescript, name, overrides (+23 more)

### Community 8 - "User Management Components & Hooks"
Cohesion: 0.27
Nodes (11): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuTrigger() (+3 more)

### Community 9 - "Vibe UI Primitive Component Elements"
Cohesion: 0.09
Nodes (22): useIsMobile(), Sheet(), SheetContent, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+14 more)

### Community 10 - "React Module"
Cohesion: 0.07
Nodes (27): dependencies, axios, class-variance-authority, clsx, date-fns, @fontsource-variable/geist, @hookform/resolvers, lightweight-charts (+19 more)

### Community 11 - "Community 11"
Cohesion: 0.31
Nodes (8): useGetInfiniteStockData(), useGetSyncLogs(), useSyncHistorical(), useWebSocket(), IngestionLogsPage(), ScreenerPage(), getHistoricalSyncStatusApi(), syncHistoricalDataApi()

### Community 12 - "Sheet Module"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 13 - "Settings Module"
Cohesion: 0.23
Nodes (6): AppError, DataExistError, DataNotFoundError, FinnhubError, GeminiApiError, currentSyncState

### Community 14 - "Components Module"
Cohesion: 0.10
Nodes (20): EnvConfig, envSchema, parsed, errorHandler(), logger, initializeDatabase(), ExtendedWebSocket, secret (+12 more)

### Community 15 - "Error Module"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 16 - "Paths Module"
Cohesion: 0.10
Nodes (20): 1. Architecture, 2. File Naming, 3. Code-Level Casing, 4. Design Pattern, 5. Layer Boundaries & Rules, 6. Testing — Backend, Alur Request (Request Lifecycle), Backend Guidelines (+12 more)

### Community 17 - "App Module"
Cohesion: 0.40
Nodes (4): LoginInput, RegisterInput, LoginSchema, RegisterSchema

### Community 18 - "Getstockbyid Module"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 19 - "Community 19"
Cohesion: 0.28
Nodes (8): useRegister(), AuthRegisterPage(), getMeApi(), loginApi(), logoutApi(), registerApi(), AuthState, User

### Community 20 - "Erasablesyntaxonly Module"
Cohesion: 0.21
Nodes (13): SettingsProfile(), SettingsProfileProps, ProfilePage(), ProfileInput, ProfileSchema, ProfileState, Card, CardContent (+5 more)

### Community 21 - "Schema Module"
Cohesion: 0.11
Nodes (18): 1.1 Membuat Fitur Frontend Baru, 1.2 Membuat Modul Backend Baru, 1.3 Membuat Migration Database, 1.4 Membuat Migration Generator (Custom), 1.5 Membuat & Menjalankan Seeder, 1.6 Menambah Environment Variable, 1. Code Generation Workflow, 2.1 Checklist Sebelum Selesai (+10 more)

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (5): UserManagementRepository, CreateUserInput, UpdateUserInput, UserQueryInput, UserManagementService

### Community 23 - "Erasablesyntaxonly Module"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (4): CreateStockFormInput, CreateStockFormSchema, UpdateStockFormInput, UpdateStockFormSchema

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
Cohesion: 0.24
Nodes (18): runBacktestSimulation(), runMultiStockOptimization(), runStrategyOptimization(), STRATEGY_WEIGHT_PROFILES, RunBacktestDto, BacktestParams, BacktestResult, OptimizationGridItem (+10 more)

### Community 29 - "Controller Module"
Cohesion: 0.12
Nodes (15): compilerOptions, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, paths (+7 more)

### Community 30 - "Canvas Module"
Cohesion: 0.19
Nodes (16): DEFAULT_DAY_RULES, DEFAULT_POSITION_RULES, DEFAULT_SWING_RULES, SettingsFormProps, UpdateSettingsFormInput, UpdateSettingsFormSchema, DialogContent, DialogDescription (+8 more)

### Community 31 - "Getsettings Module"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+9 more)

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (3): GeminiAdapter, decrypt(), SECRET_KEY

### Community 33 - "Community 33"
Cohesion: 0.26
Nodes (13): ScreenerResultsProps, StockFormDialogProps, StockTableProps, StockSearchResult, Stock, Table, TableBody, TableCaption (+5 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (15): validateBody(), validateQuery(), ScreenerController, controller, router, StockDataQuery, StockDataQuerySchema, StockQuoteQuery (+7 more)

### Community 35 - "Community 35"
Cohesion: 0.07
Nodes (40): AiAnalysisCard(), AiAnalysisCardProps, ScoreRowProps, FormInput, ScoringRulesForm(), ScoringRulesFormProps, StockChartCanvas(), StockChartCanvasProps (+32 more)

### Community 36 - "Community 36"
Cohesion: 0.23
Nodes (11): data, NavMain(), NavProjects(), NavUser(), TeamSwitcher(), Sidebar(), SidebarContent(), SidebarFooter() (+3 more)

### Community 37 - "Homepagefeatures Module"
Cohesion: 0.17
Nodes (11): 1. Architecture, 2. File & Folder Naming, 3. Suffix Wajib, 4. Code-Level Casing, 5. Design Patterns, 6. Path Alias, 7. Testing — Frontend, 8. Aturan QA (+3 more)

### Community 38 - "Community 38"
Cohesion: 0.24
Nodes (9): Collapsible(), CollapsibleContent(), CollapsibleTrigger(), SidebarGroup(), SidebarGroupLabel(), SidebarMenuAction, SidebarMenuSub(), SidebarMenuSubButton (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (8): authRoutes, backtestRoutes, liveScreenerRoutes, v1Router, screenerRoutes, settingsRoutes, stocksRoutes, userManagementRoutes

### Community 40 - "Controller Module"
Cohesion: 0.18
Nodes (7): filePath, normalizedName, SCHEMA_INDEX_PATH, SCHEMAS_DIR, tableName, typeName, variableName

### Community 41 - "Community 41"
Cohesion: 0.26
Nodes (7): WebSocketError, parseWebSocketKey(), WebSocketKey, WebSocketContext, WS_URL, ClientSocket, WsMessage

### Community 42 - "Community 42"
Cohesion: 0.06
Nodes (29): db, queryClient, LiveScreenerRepository, aiAnalyses, AiAnalysis, NewAiAnalysis, BacktestReport, backtestReports (+21 more)

### Community 43 - "Fail Module"
Cohesion: 0.20
Nodes (9): 1. Architecture, 2. File Naming, 3. Code-Level Casing, 4. Design Pattern, 5. Layer Boundaries & Rules, 6. Testing — Backend, Alur Request (Request Lifecycle), Backend Guidelines (+1 more)

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (10): GlobalErrorContainer(), RegisterFormProps, ScreenerSearchProps, ErrorState, StoredError, useErrorStore, Button, ButtonProps (+2 more)

### Community 47 - "Login Module"
Cohesion: 0.25
Nodes (7): Admonitions, Code Blocks, Front Matter, Images, Links, Markdown Features, MDX and React Components

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (3): StocksRepository, CreateStockInput, StockQueryInput

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

### Community 62 - "Config Module"
Cohesion: 0.50
Nodes (3): ImportMeta, ImportMetaEnv, Window

### Community 65 - "Exchanges Module"
Cohesion: 0.50
Nodes (3): Build your site, Deploy your site, Deploy your site

### Community 89 - "Community 89"
Cohesion: 0.22
Nodes (8): LoginInput, RegisterInput, controller, router, LoginInputSchema, RegisterInputSchema, authLimiter, generalLimiter

### Community 90 - "Community 90"
Cohesion: 0.17
Nodes (13): AppSidebar(), useLogin(), AuthLoginPage(), WebSocketProvider(), AuthLayout(), PlatformLayout(), queryClient, useAuthStore (+5 more)

### Community 91 - "Community 91"
Cohesion: 0.10
Nodes (13): requireAdmin(), ScoringRulesRepository, SettingsController, controller, router, UpdateScoringRulesBatchInput, UpdateScoringRulesBatchSchema, UpdateScoringRuleSchema (+5 more)

### Community 92 - "Community 92"
Cohesion: 0.21
Nodes (4): AuthController, AuthRepository, AuthService, UnauthorizedError

### Community 93 - "Community 93"
Cohesion: 0.18
Nodes (10): Calendar(), CalendarDayButton(), DatePicker(), DatePickerProps, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+2 more)

### Community 94 - "Community 94"
Cohesion: 0.24
Nodes (8): InfoPresenter(), InfoPresenterProps, useGetInfo(), infoKeys, InfoLandingPage(), fetchTechStackInfo(), triggerBackendSentryTest(), TechStackInfo

### Community 96 - "Community 96"
Cohesion: 0.22
Nodes (9): QuoteDetailsProps, api, useGetInfiniteLiveStockData(), liveScreenerKeys, LiveScreenerPage(), getLiveStockDataApi(), updateStockApi(), StockDataQueryParams (+1 more)

### Community 98 - "Community 98"
Cohesion: 0.29
Nodes (4): SettingsClientService, SettingsClientExchageSchema, SettingsClientServiceSchema, SettingsRepository

### Community 99 - "Community 99"
Cohesion: 0.31
Nodes (6): UserManagementController, controller, router, CreateUserSchema, UpdateUserSchema, UserQuerySchema

### Community 100 - "Community 100"
Cohesion: 0.11
Nodes (34): backtestKeys, BacktestFormInput, BacktestFormSchema, BacktestCharts(), BacktestChartsProps, OptimizationModal(), OptimizationModalProps, TradesTable() (+26 more)

### Community 101 - "Community 101"
Cohesion: 0.29
Nodes (6): LoginForm(), RegisterForm(), SettingsForm(), StockFormDialog(), UserFormDialog(), useSyncExchanges()

### Community 102 - "Community 102"
Cohesion: 0.29
Nodes (7): WebSocketService, historicalSyncState, calculateATR(), calculateEMA(), calculateMACD(), calculateRSI(), calculateSMA()

### Community 103 - "Community 103"
Cohesion: 0.24
Nodes (7): LiveScreenerController, controller, router, LiveStockDataQuerySchema, authRepository, requireAuth(), secret

### Community 104 - "Community 104"
Cohesion: 0.31
Nodes (6): BacktestController, controller, router, AiAlternativeSchema, RunBacktestSchema, RunMultiBacktestSchema

### Community 106 - "Community 106"
Cohesion: 0.21
Nodes (8): StocksController, controller, router, CreateStockSchema, StockQuerySchema, SyncState, SyncStateSchema, UpdateStockSchema

### Community 107 - "Community 107"
Cohesion: 0.15
Nodes (12): initCsrf(), useGetQuote(), screenerKeys, getAiAnalysisApi(), getStockDataApi(), getStockHistoricalDataApi(), getStockQuoteApi(), getSyncLogsApi() (+4 more)

### Community 111 - "Community 111"
Cohesion: 0.18
Nodes (11): Field(), FieldContent(), FieldDescription(), FieldError(), FieldLegend(), FieldSeparator(), FieldSet(), FieldTitle() (+3 more)

### Community 115 - "Community 115"
Cohesion: 0.40
Nodes (4): CreateUserFormInput, CreateUserFormSchema, UpdateUserFormInput, UpdateUserFormSchema

## Knowledge Gaps
- **490 isolated node(s):** `name`, `version`, `private`, `main`, `dev` (+485 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `Community 92` to `Community 101`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `BacktestPage()` connect `Community 100` to `Frontend Components & Screener UI`, `Community 90`, `Community 11`, `Community 101`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 5` to `Community 33`, `React UI Hook Utils & File Upload`, `Community 36`, `Community 38`, `User Management Components & Hooks`, `Vibe UI Primitive Component Elements`, `Community 44`, `Community 111`, `Erasablesyntaxonly Module`, `Community 90`, `Community 93`, `Canvas Module`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _490 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Screener Providers & API Adapters` be split into smaller, more focused modules?**
  _Cohesion score 0.13978494623655913 - nodes in this community are weakly interconnected._
- **Should `Backend Package & Express Middleware Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `React UI Hook Utils & File Upload` be split into smaller, more focused modules?**
  _Cohesion score 0.07897793263646923 - nodes in this community are weakly interconnected._