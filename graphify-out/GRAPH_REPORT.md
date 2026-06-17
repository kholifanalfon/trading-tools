<<<<<<< Updated upstream
# Graph Report - trading  (2026-06-16)

## Corpus Check
- 293 files · ~90,771 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1388 nodes · 2721 edges · 100 communities (87 shown, 13 thin omitted)
=======
# Graph Report - trading  (2026-06-18)

## Corpus Check
- 307 files · ~99,811 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1419 nodes · 2790 edges · 115 communities (97 shown, 18 thin omitted)
>>>>>>> Stashed changes
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
<<<<<<< Updated upstream
- Built from commit: `10a293ad`
=======
- Built from commit: `00d0af0c`
>>>>>>> Stashed changes
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
- [[_COMMUNITY_Paths Module|Paths Module]]
- [[_COMMUNITY_React Module|React Module]]
- [[_COMMUNITY_Getusers Module|Getusers Module]]
- [[_COMMUNITY_Popover Module|Popover Module]]
- [[_COMMUNITY_Api Module|Api Module]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Canvas Module|Canvas Module]]
- [[_COMMUNITY_Getsettings Module|Getsettings Module]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Homepagefeatures Module|Homepagefeatures Module]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Controller Module|Controller Module]]
- [[_COMMUNITY_Community 41|Community 41]]
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
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 106|Community 106]]
- [[_COMMUNITY_Community 110|Community 110]]
<<<<<<< Updated upstream
=======
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 115|Community 115]]
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
- `LoginFormProps` --references--> `ApiError`  [EXTRACTED]
  apps/frontend/src/features/auth/components/login-form.tsx → apps/frontend/src/shared/config/api.ts
- `AvatarBadge()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/avatar.tsx → apps/frontend/src/shared/utils/cn.ts
- `AvatarGroup()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/avatar.tsx → apps/frontend/src/shared/utils/cn.ts
- `AvatarGroupCount()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/avatar.tsx → apps/frontend/src/shared/utils/cn.ts
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/dropdown-menu.tsx → apps/frontend/src/shared/utils/cn.ts
=======
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
>>>>>>> Stashed changes

## Import Cycles
- None detected.

<<<<<<< Updated upstream
## Communities (100 total, 13 thin omitted)

### Community 0 - "Frontend Components & Screener UI"
Cohesion: 0.05
Nodes (64): QuoteDetailsProps, ScreenerResultsProps, StockFormDialogProps, StockTable(), StockTableProps, StrategyScoreCard(), StrategyScoreCardProps, api (+56 more)
=======
## Communities (115 total, 18 thin omitted)

### Community 0 - "Frontend Components & Screener UI"
Cohesion: 0.16
Nodes (20): LoginFormProps, StockTable(), ApiError, useCreateStock(), useDeleteStock(), useGetStocks(), useSyncStock(), useUpdateStock() (+12 more)
>>>>>>> Stashed changes

### Community 1 - "Auth Schemas & Auth Services"
Cohesion: 0.17
Nodes (18): UserFormDialogProps, UserTable(), UserTableProps, useCreateUser(), useDeleteUser(), useGetUsers(), useUpdateUser(), UserManagementListPage() (+10 more)

### Community 2 - "Screener Providers & API Adapters"
<<<<<<< Updated upstream
Cohesion: 0.19
Nodes (9): FinnhubAdapter, YahooFinanceAdapter, getFinnhubClient(), yahooFinance, StockQuote, StockSearchResult, HistoricalDataPoint, ScreenerProviderAdapter (+1 more)
=======
Cohesion: 0.14
Nodes (12): FinnhubAdapter, YahooFinanceAdapter, getFinnhubClient(), yahooFinance, LiveStockDataQuery, CacheEntry, LiveScreenerService, StockQuote (+4 more)
>>>>>>> Stashed changes

### Community 3 - "Backend Package & Express Middleware Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, cookie-parser, cors, csrf-csrf, dotenv, drizzle-orm, express, express-rate-limit (+35 more)

### Community 4 - "React UI Hook Utils & File Upload"
Cohesion: 0.08
Nodes (37): useAsRef(), useLazyRef(), Direction, FileState, FileUpload(), FileUploadClear(), FileUploadClearProps, FileUploadContext (+29 more)

### Community 5 - "Community 5"
<<<<<<< Updated upstream
Cohesion: 0.26
Nodes (13): LoginFormProps, RegisterFormProps, Button, ButtonProps, Card, CardContent, CardDescription, CardHeader (+5 more)
=======
Cohesion: 0.14
Nodes (21): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Badge(), BadgeProps (+13 more)
>>>>>>> Stashed changes

### Community 6 - "Docusaurus Documentation Site Packages"
Cohesion: 0.06
Nodes (32): browserslist, development, production, dependencies, clsx, @docusaurus/core, @docusaurus/preset-classic, @mdx-js/react (+24 more)

### Community 7 - "Monorepo Package Configuration"
Cohesion: 0.06
Nodes (31): dependencies, dotenv, postgres, devDependencies, @types/node, typescript, name, overrides (+23 more)

### Community 8 - "User Management Components & Hooks"
<<<<<<< Updated upstream
Cohesion: 0.13
Nodes (22): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), DropdownMenu(), DropdownMenuCheckboxItem() (+14 more)
=======
Cohesion: 0.27
Nodes (11): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuTrigger() (+3 more)
>>>>>>> Stashed changes

### Community 9 - "Vibe UI Primitive Component Elements"
Cohesion: 0.09
Nodes (22): useIsMobile(), Sheet(), SheetContent, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle (+14 more)

### Community 10 - "React Module"
Cohesion: 0.07
Nodes (27): dependencies, axios, class-variance-authority, clsx, date-fns, @fontsource-variable/geist, @hookform/resolvers, lightweight-charts (+19 more)

### Community 11 - "Community 11"
<<<<<<< Updated upstream
Cohesion: 0.28
Nodes (4): FormInput, ScreenerSearchProps, Input, InputProps
=======
Cohesion: 0.23
Nodes (5): db, queryClient, LiveScreenerRepository, settings, users
>>>>>>> Stashed changes

### Community 12 - "Sheet Module"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 13 - "Settings Module"
<<<<<<< Updated upstream
Cohesion: 0.22
Nodes (6): AppError, DataExistError, DataNotFoundError, FinnhubError, GeminiApiError, currentSyncState

### Community 14 - "Components Module"
Cohesion: 0.10
Nodes (21): EnvConfig, envSchema, parsed, errorHandler(), logger, initializeDatabase(), ExtendedWebSocket, secret (+13 more)
=======
Cohesion: 0.05
Nodes (25): AppError, UnauthorizedError, DataExistError, DataNotFoundError, FinnhubError, GeminiApiError, StocksController, StocksRepository (+17 more)

### Community 14 - "Components Module"
Cohesion: 0.09
Nodes (22): EnvConfig, envSchema, parsed, errorHandler(), logger, initializeDatabase(), ExtendedWebSocket, secret (+14 more)
>>>>>>> Stashed changes

### Community 15 - "Error Module"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 16 - "Paths Module"
Cohesion: 0.10
Nodes (20): 1. Architecture, 2. File Naming, 3. Code-Level Casing, 4. Design Pattern, 5. Layer Boundaries & Rules, 6. Testing — Backend, Alur Request (Request Lifecycle), Backend Guidelines (+12 more)

### Community 17 - "App Module"
<<<<<<< Updated upstream
Cohesion: 0.07
Nodes (25): db, queryClient, LiveScreenerRepository, BacktestReport, backtestReports, NewBacktestReport, NewScoringRule, ScoringRule (+17 more)
=======
Cohesion: 0.40
Nodes (4): LoginInput, RegisterInput, LoginSchema, RegisterSchema
>>>>>>> Stashed changes

### Community 18 - "Getstockbyid Module"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 19 - "Community 19"
Cohesion: 0.13
Nodes (15): WebSocketError, useRegister(), parseWebSocketKey(), WebSocketKey, AuthRegisterPage(), WebSocketContext, WS_URL, getMeApi() (+7 more)

### Community 20 - "Erasablesyntaxonly Module"
<<<<<<< Updated upstream
Cohesion: 0.17
Nodes (12): WebSocketService, LiveStockDataQuery, CacheEntry, LiveScreenerService, historicalSyncState, decrypt(), SECRET_KEY, calculateATR() (+4 more)
=======
Cohesion: 0.22
Nodes (13): RegisterFormProps, ScreenerSearchProps, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle (+5 more)
>>>>>>> Stashed changes

### Community 21 - "Schema Module"
Cohesion: 0.11
Nodes (18): 1.1 Membuat Fitur Frontend Baru, 1.2 Membuat Modul Backend Baru, 1.3 Membuat Migration Database, 1.4 Membuat Migration Generator (Custom), 1.5 Membuat & Menjalankan Seeder, 1.6 Menambah Environment Variable, 1. Code Generation Workflow, 2.1 Checklist Sebelum Selesai (+10 more)

### Community 22 - "Community 22"
<<<<<<< Updated upstream
Cohesion: 0.16
Nodes (5): UserManagementRepository, CreateUserInput, UpdateUserInput, UserQueryInput, UserManagementService
=======
Cohesion: 0.25
Nodes (11): AiAnalysisCard(), AiAnalysisCardProps, ScoreRowProps, StrategyScoreCard(), StrategyScoreCardProps, useGetAiAnalysis(), useRefreshAiAnalysis(), useGetQuote() (+3 more)
>>>>>>> Stashed changes

### Community 23 - "Erasablesyntaxonly Module"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

<<<<<<< Updated upstream
### Community 24 - "Paths Module"
Cohesion: 0.21
Nodes (10): SettingsProfile(), SettingsProfileProps, ProfilePage(), ProfileInput, ProfileSchema, ProfileState, CardFooter, Label (+2 more)
=======
### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (4): CreateStockFormInput, CreateStockFormSchema, UpdateStockFormInput, UpdateStockFormSchema
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
Cohesion: 0.17
Nodes (15): CreateStockFormInput, CreateStockFormSchema, UpdateStockFormInput, UpdateStockFormSchema, DialogContent, DialogDescription, DialogHeader(), DialogOverlay (+7 more)
=======
Cohesion: 0.19
Nodes (18): DEFAULT_DAY_RULES, DEFAULT_POSITION_RULES, DEFAULT_SWING_RULES, SettingsFormProps, UpdateSettingsFormInput, UpdateSettingsFormSchema, Button, ButtonProps (+10 more)
>>>>>>> Stashed changes

### Community 31 - "Getsettings Module"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+9 more)

<<<<<<< Updated upstream
### Community 32 - "Controller Module"
Cohesion: 0.29
Nodes (7): Field(), FieldContent(), FieldError(), FieldLegend(), FieldSet(), FieldTitle(), fieldVariants
=======
### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (3): GeminiAdapter, decrypt(), SECRET_KEY
>>>>>>> Stashed changes

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (15): ScreenerResultsProps, StockFormDialogProps, StockTableProps, useGetSyncLogs(), IngestionLogsPage(), StockSearchResult, Stock, Table (+7 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (13): ScreenerController, controller, router, StockDataQuery, StockDataQuerySchema, StockQuoteQuery, StockQuoteQuerySchema, StockQuoteSchema (+5 more)

### Community 35 - "Community 35"
<<<<<<< Updated upstream
Cohesion: 0.27
Nodes (8): DEFAULT_DAY_RULES, DEFAULT_POSITION_RULES, DEFAULT_SWING_RULES, SettingsForm(), SettingsFormProps, useSyncExchanges(), UpdateSettingsFormInput, UpdateSettingsFormSchema
=======
Cohesion: 0.16
Nodes (20): FormInput, ScoringRulesForm(), ScoringRulesFormProps, useGetScoringRules(), useGetSettings(), useUpdateScoringRules(), useUpdateSettings(), SettingsPage() (+12 more)
>>>>>>> Stashed changes

### Community 36 - "Community 36"
Cohesion: 0.23
Nodes (11): data, NavMain(), NavProjects(), NavUser(), TeamSwitcher(), Sidebar(), SidebarContent(), SidebarFooter() (+3 more)

### Community 37 - "Homepagefeatures Module"
Cohesion: 0.17
Nodes (11): 1. Architecture, 2. File & Folder Naming, 3. Suffix Wajib, 4. Code-Level Casing, 5. Design Patterns, 6. Path Alias, 7. Testing — Frontend, 8. Aturan QA (+3 more)

### Community 38 - "Community 38"
<<<<<<< Updated upstream
Cohesion: 0.27
Nodes (8): Collapsible(), CollapsibleContent(), CollapsibleTrigger(), SidebarGroupLabel(), SidebarMenuItem(), SidebarMenuSub(), SidebarMenuSubButton, SidebarMenuSubItem()
=======
Cohesion: 0.24
Nodes (9): Collapsible(), CollapsibleContent(), CollapsibleTrigger(), SidebarGroup(), SidebarGroupLabel(), SidebarMenuAction, SidebarMenuSub(), SidebarMenuSubButton (+1 more)
>>>>>>> Stashed changes

### Community 39 - "Community 39"
Cohesion: 0.14
Nodes (12): authRoutes, backtestRoutes, LiveScreenerController, controller, liveScreenerRoutes, router, LiveStockDataQuerySchema, v1Router (+4 more)

### Community 40 - "Controller Module"
Cohesion: 0.18
Nodes (7): filePath, normalizedName, SCHEMA_INDEX_PATH, SCHEMAS_DIR, tableName, typeName, variableName

### Community 41 - "Community 41"
<<<<<<< Updated upstream
Cohesion: 0.40
Nodes (4): LoginForm(), RegisterForm(), StockFormDialog(), UserFormDialog()
=======
Cohesion: 0.21
Nodes (10): StockChartCanvas(), StockChartCanvasProps, initialState, Theme, ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.15
Nodes (9): NewStockData, StockData, NewStockLog, StockLog, stockLogs, NewStock, Stock, stocks (+1 more)
>>>>>>> Stashed changes

### Community 43 - "Fail Module"
Cohesion: 0.20
Nodes (9): 1. Architecture, 2. File Naming, 3. Code-Level Casing, 4. Design Pattern, 5. Layer Boundaries & Rules, 6. Testing — Backend, Alur Request (Request Lifecycle), Backend Guidelines (+1 more)

### Community 44 - "Community 44"
<<<<<<< Updated upstream
Cohesion: 0.28
Nodes (6): GlobalErrorContainer(), beforeSend(), generateUUID(), ErrorState, StoredError, useErrorStore

### Community 45 - "Community 45"
Cohesion: 0.19
Nodes (18): ScoringRulesForm(), ScoringRulesFormProps, useGetScoringRules(), useUpdateScoringRules(), useUpdateSettings(), SettingsPage(), getAiScreenerRecommendationApi(), getScoringRulesApi() (+10 more)
=======
Cohesion: 0.33
Nodes (4): GlobalErrorContainer(), ErrorState, StoredError, useErrorStore
>>>>>>> Stashed changes

### Community 47 - "Login Module"
Cohesion: 0.25
Nodes (7): Admonitions, Code Blocks, Front Matter, Images, Links, Markdown Features, MDX and React Components

### Community 48 - "Community 48"
<<<<<<< Updated upstream
Cohesion: 0.10
Nodes (12): StocksRepository, controller, router, CreateStockInput, CreateStockSchema, StockQueryInput, StockQuerySchema, SyncState (+4 more)
=======
Cohesion: 0.28
Nodes (4): api, initCsrf(), beforeSend(), generateUUID()
>>>>>>> Stashed changes

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

### Community 65 - "Exchanges Module"
Cohesion: 0.50
Nodes (3): Build your site, Deploy your site, Deploy your site

### Community 89 - "Community 89"
<<<<<<< Updated upstream
Cohesion: 0.22
Nodes (8): LoginInput, RegisterInput, controller, router, LoginInputSchema, RegisterInputSchema, authLimiter, generalLimiter
=======
Cohesion: 0.19
Nodes (8): LoginInput, RegisterInput, AuthController, controller, router, LoginInputSchema, RegisterInputSchema, AuthService
>>>>>>> Stashed changes

### Community 90 - "Community 90"
Cohesion: 0.17
Nodes (13): AppSidebar(), useLogin(), AuthLoginPage(), WebSocketProvider(), AuthLayout(), PlatformLayout(), queryClient, useAuthStore (+5 more)
<<<<<<< Updated upstream
=======

### Community 91 - "Community 91"
Cohesion: 0.24
Nodes (5): SettingsController, UpdateSettingsInput, MASTER_EXCHANGES, SettingsService, encrypt()

### Community 92 - "Community 92"
Cohesion: 0.14
Nodes (11): AuthRepository, requireAdmin(), authRepository, requireAuth(), secret, controller, router, UpdateScoringRulesBatchInput (+3 more)
>>>>>>> Stashed changes

### Community 93 - "Community 93"
Cohesion: 0.16
Nodes (18): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator(), Calendar() (+10 more)

### Community 94 - "Community 94"
Cohesion: 0.24
Nodes (8): InfoPresenter(), InfoPresenterProps, useGetInfo(), infoKeys, InfoLandingPage(), fetchTechStackInfo(), triggerBackendSentryTest(), TechStackInfo

### Community 96 - "Community 96"
<<<<<<< Updated upstream
Cohesion: 0.40
Nodes (4): LoginInput, RegisterInput, LoginSchema, RegisterSchema
=======
Cohesion: 0.23
Nodes (9): QuoteDetailsProps, useGetInfiniteLiveStockData(), useWebSocket(), liveScreenerKeys, LiveScreenerPage(), getLiveStockDataApi(), updateStockApi(), StockDataQueryParams (+1 more)
>>>>>>> Stashed changes

### Community 98 - "Community 98"
Cohesion: 0.29
Nodes (4): SettingsClientService, SettingsClientExchageSchema, SettingsClientServiceSchema, SettingsRepository

### Community 99 - "Community 99"
<<<<<<< Updated upstream
Cohesion: 0.10
Nodes (13): requireAdmin(), ScoringRulesRepository, SettingsController, controller, router, UpdateScoringRulesBatchInput, UpdateScoringRulesBatchSchema, UpdateScoringRuleSchema (+5 more)
=======
Cohesion: 0.24
Nodes (8): validateBody(), validateQuery(), UserManagementController, controller, router, CreateUserSchema, UpdateUserSchema, UserQuerySchema
>>>>>>> Stashed changes

### Community 100 - "Community 100"
Cohesion: 0.11
Nodes (34): backtestKeys, BacktestFormInput, BacktestFormSchema, BacktestCharts(), BacktestChartsProps, OptimizationModal(), OptimizationModalProps, TradesTable() (+26 more)

<<<<<<< Updated upstream
### Community 106 - "Community 106"
Cohesion: 0.12
Nodes (17): BacktestController, controller, router, AiAlternativeSchema, RunBacktestSchema, RunMultiBacktestSchema, authRepository, requireAuth() (+9 more)

### Community 110 - "Community 110"
Cohesion: 0.21
Nodes (4): AuthController, AuthRepository, AuthService, UnauthorizedError

## Knowledge Gaps
- **483 isolated node(s):** `name`, `version`, `private`, `main`, `dev` (+478 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.
=======
### Community 101 - "Community 101"
Cohesion: 0.15
Nodes (12): LoginForm(), RegisterForm(), SettingsForm(), SettingsProfile(), SettingsProfileProps, StockFormDialog(), UserFormDialog(), useSyncExchanges() (+4 more)

### Community 102 - "Community 102"
Cohesion: 0.29
Nodes (7): WebSocketService, historicalSyncState, calculateATR(), calculateEMA(), calculateMACD(), calculateRSI(), calculateSMA()

### Community 103 - "Community 103"
Cohesion: 0.38
Nodes (4): LiveScreenerController, controller, router, LiveStockDataQuerySchema

### Community 104 - "Community 104"
Cohesion: 0.31
Nodes (6): BacktestController, controller, router, AiAlternativeSchema, RunBacktestSchema, RunMultiBacktestSchema

### Community 105 - "Community 105"
Cohesion: 0.32
Nodes (4): aiAnalyses, AiAnalysis, NewAiAnalysis, AiAnalysisRepository

### Community 106 - "Community 106"
Cohesion: 0.38
Nodes (4): NewScoringRule, ScoringRule, scoringRules, seed()

### Community 107 - "Community 107"
Cohesion: 0.18
Nodes (13): useGetInfiniteStockData(), useSyncHistorical(), ScreenerPage(), screenerKeys, getAiAnalysisApi(), getHistoricalSyncStatusApi(), getStockDataApi(), getStockHistoricalDataApi() (+5 more)

### Community 110 - "Community 110"
Cohesion: 0.50
Nodes (3): BacktestReport, backtestReports, NewBacktestReport

### Community 111 - "Community 111"
Cohesion: 0.22
Nodes (9): Field(), FieldContent(), FieldError(), FieldLegend(), FieldSet(), FieldTitle(), fieldVariants, Label (+1 more)

### Community 115 - "Community 115"
Cohesion: 0.40
Nodes (4): CreateUserFormInput, CreateUserFormSchema, UpdateUserFormInput, UpdateUserFormSchema

## Knowledge Gaps
- **490 isolated node(s):** `name`, `version`, `private`, `main`, `dev` (+485 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.
>>>>>>> Stashed changes

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

<<<<<<< Updated upstream
- **Why does `AuthService` connect `Community 110` to `Community 41`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._
- **Why does `BacktestPage()` connect `Community 100` to `Frontend Components & Screener UI`, `Community 41`, `Community 90`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 93` to `Frontend Components & Screener UI`, `Controller Module`, `React UI Hook Utils & File Upload`, `Community 5`, `Community 36`, `Community 38`, `User Management Components & Hooks`, `Vibe UI Primitive Component Elements`, `Community 11`, `Paths Module`, `Community 90`, `Canvas Module`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _483 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend Components & Screener UI` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
=======
- **Why does `AuthService` connect `Community 89` to `Community 101`, `Settings Module`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `BacktestPage()` connect `Community 100` to `Frontend Components & Screener UI`, `Community 90`, `Community 96`, `Community 101`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 5` to `Community 33`, `React UI Hook Utils & File Upload`, `Community 101`, `Community 36`, `Community 38`, `User Management Components & Hooks`, `Vibe UI Primitive Component Elements`, `Community 111`, `Erasablesyntaxonly Module`, `Community 90`, `Community 93`, `Canvas Module`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _490 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Screener Providers & API Adapters` be split into smaller, more focused modules?**
  _Cohesion score 0.13978494623655913 - nodes in this community are weakly interconnected._
>>>>>>> Stashed changes
- **Should `Backend Package & Express Middleware Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `React UI Hook Utils & File Upload` be split into smaller, more focused modules?**
  _Cohesion score 0.07897793263646923 - nodes in this community are weakly interconnected._