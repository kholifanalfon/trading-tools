# Graph Report - trading  (2026-06-20)

## Corpus Check
- 316 files · ~114,657 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1471 nodes · 2929 edges · 118 communities (98 shown, 20 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d66bcca2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 117|Community 117]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 103 edges
2. `Button` - 31 edges
3. `ApiError` - 29 edges
4. `runBacktestSimulation()` - 23 edges
5. `AppError` - 18 edges
6. `compilerOptions` - 18 edges
7. `scripts` - 18 edges
8. `compilerOptions` - 17 edges
9. `calculateMetricsAndScores()` - 16 edges
10. `ScreenerService` - 16 edges

## Surprising Connections (you probably didn't know these)
- `LoginFormProps` --references--> `ApiError`  [EXTRACTED]
  apps/frontend/src/features/auth/components/login-form.tsx → apps/frontend/src/shared/config/api.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/breadcrumb.tsx → apps/frontend/src/shared/utils/cn.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/dialog.tsx → apps/frontend/src/shared/utils/cn.ts
- `FieldSet()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/field.tsx → apps/frontend/src/shared/utils/cn.ts
- `FieldLegend()` --calls--> `cn()`  [EXTRACTED]
  apps/frontend/src/shared/components/ui/field.tsx → apps/frontend/src/shared/utils/cn.ts

## Import Cycles
- None detected.

## Communities (118 total, 20 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (43): dependencies, cookie-parser, cors, csrf-csrf, dotenv, drizzle-orm, express, express-rate-limit (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (34): backtestKeys, BacktestFormInput, BacktestFormSchema, BacktestCharts(), BacktestChartsProps, OptimizationModal(), OptimizationModalProps, TradesTable() (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (37): useAsRef(), useLazyRef(), Direction, FileState, FileUpload(), FileUploadClear(), FileUploadClearProps, FileUploadContext (+29 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (28): AiScoringRecommendationDialog(), FormInput, ScoringRulesForm(), ScoringRulesFormProps, SettingsFormProps, useGetAiScoringRulesRecommendation(), useGetScoringRules(), useUpdateScoringRules() (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (32): useIsMobile(), Collapsible(), CollapsibleContent(), CollapsibleTrigger(), Sheet(), SheetContent, SheetDescription, SheetFooter() (+24 more)

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (19): StockTable(), ApiError, useCreateStock(), useDeleteStock(), useGetStocks(), useSyncStock(), useUpdateStock(), StockListPage() (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (32): browserslist, development, production, dependencies, clsx, @docusaurus/core, @docusaurus/preset-classic, @mdx-js/react (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (31): dependencies, dotenv, postgres, devDependencies, @types/node, typescript, name, overrides (+23 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (22): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), Calendar(), CalendarDayButton() (+14 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (20): AiRecommendationDialog(), AiRecommendationDialogProps, AVAILABLE_FIELDS, AVAILABLE_OPERATORS, AiScoringRecommendationDialogProps, PositionSizingCalculatorProps, DEFAULT_DAY_RULES, DEFAULT_POSITION_RULES (+12 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (28): dependencies, axios, class-variance-authority, clsx, date-fns, @fontsource-variable/geist, @hookform/resolvers, lightweight-charts (+20 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (18): UserFormDialogProps, UserTable(), UserTableProps, useCreateUser(), useDeleteUser(), useGetUsers(), useUpdateUser(), UserManagementListPage() (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (10): FinnhubAdapter, YahooFinanceAdapter, getFinnhubClient(), yahooFinance, StockQuote, StockSearchResult, historicalSyncState, HistoricalDataPoint (+2 more)

### Community 13 - "Community 13"
Cohesion: 0.30
Nodes (21): runBacktestSimulation(), ScoreMetrics, ScorePayload, calculateAccumulationDistribution(), calculateADX(), calculateATR(), calculateBollingerBands(), calculateEMA() (+13 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (15): WebSocketError, useRegister(), parseWebSocketKey(), WebSocketKey, AuthRegisterPage(), WebSocketContext, WS_URL, getMeApi() (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.13
Nodes (18): useLogin(), AuthLoginPage(), WebSocketProvider(), AuthLayout(), PlatformLayout(), PullToRefreshProps, queryClient, useAuthStore (+10 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (18): validateBody(), validateQuery(), ScreenerController, controller, router, StockDataQuery, StockDataQuerySchema, StockQuoteQuery (+10 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (15): EnvConfig, envSchema, parsed, errorHandler(), initializeDatabase(), corsMiddleware, csrfProtection(), { doubleCsrfProtection, generateCsrfToken } (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (7): AppError, UnauthorizedError, DataExistError, DataNotFoundError, FinnhubError, GeminiApiError, currentSyncState

### Community 20 - "Community 20"
Cohesion: 0.21
Nodes (15): ScreenerResultsProps, StockFormDialogProps, StockTableProps, StockSearchResult, Stock, Badge(), BadgeProps, Table (+7 more)

### Community 21 - "Community 21"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 22 - "Community 22"
Cohesion: 0.19
Nodes (10): screenerKeys, getAiAnalysisApi(), getCorporateActionsApi(), getStockDataApi(), getStockHistoricalDataApi(), getStockQuoteApi(), getSyncLogsApi(), refreshAiAnalysisApi() (+2 more)

### Community 23 - "Community 23"
Cohesion: 0.13
Nodes (8): UserManagementRepository, CreateUserInput, CreateUserSchema, UpdateUserInput, UpdateUserSchema, UserQueryInput, UserQuerySchema, UserManagementService

### Community 24 - "Community 24"
Cohesion: 0.16
Nodes (13): runMultiStockOptimization(), runStrategyOptimization(), STRATEGY_WEIGHT_PROFILES, RunBacktestDto, BacktestParams, BacktestResult, OptimizationGridItem, TradeLog (+5 more)

### Community 25 - "Community 25"
Cohesion: 0.23
Nodes (14): InfoPresenterProps, LoginFormProps, RegisterFormProps, TechStackInfo, Card, CardContent, CardDescription, CardHeader (+6 more)

### Community 26 - "Community 26"
Cohesion: 0.16
Nodes (8): LiveStockDataQuery, LiveStockDataQuerySchema, CacheEntry, LiveScreenerService, SettingsClientService, SettingsClientExchageSchema, SettingsClientServiceSchema, SettingsRepository

### Community 27 - "Community 27"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+10 more)

### Community 28 - "Community 28"
Cohesion: 0.15
Nodes (9): NewStockData, StockData, NewStockLog, StockLog, stockLogs, NewStock, Stock, stocks (+1 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (18): 1.1 Membuat Fitur Frontend Baru, 1.2 Membuat Modul Backend Baru, 1.3 Membuat Migration Database, 1.4 Membuat Migration Generator (Custom), 1.5 Membuat & Menjalankan Seeder, 1.6 Menambah Environment Variable, 1. Code Generation Workflow, 2.1 Checklist Sebelum Selesai (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.27
Nodes (5): db, queryClient, scoringRules, users, seed()

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (12): BacktestController, controller, router, AiAlternativeSchema, RunBacktestSchema, RunMultiBacktestSchema, LiveScreenerController, controller (+4 more)

### Community 32 - "Community 32"
Cohesion: 0.14
Nodes (14): CreateStockFormInput, CreateStockFormSchema, UpdateStockFormInput, UpdateStockFormSchema, Field(), FieldContent(), FieldError(), FieldLabel() (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.16
Nodes (16): AppSidebar(), data, NavMain(), NavProjects(), NavUser(), TeamSwitcher(), PwaContext, PwaContextType (+8 more)

### Community 34 - "Community 34"
Cohesion: 0.27
Nodes (11): DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuTrigger() (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.11
Nodes (17): 1.1 Membuat Fitur Frontend Baru, 1.2 Membuat Modul Backend Baru, 1.3 Membuat Migration Database, 1.5 Membuat & Menjalankan Seeder, 1.6 Menambah Environment Variable, 1. Code Generation Workflow, 2.1 Checklist Sebelum Selesai, 2.2 Perintah Verifikasi (+9 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (17): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+9 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (16): 1. Tech Stack, 2. Monorepo Structure, 3. Environment Configuration, 4. Database CLI Commands, 5. Branching & Git Workflow, 6. CI/CD (GitHub Actions), Alur Pengembangan Fitur (Git Flow), Backend (Express + Bun) (+8 more)

### Community 39 - "Community 39"
Cohesion: 0.12
Nodes (16): 1. Tech Stack, 2. Monorepo Structure, 3. Environment Configuration, 4. Database CLI Commands, 5. Branching & Git Workflow, 6. CI/CD (GitHub Actions), Alur Pengembangan Fitur (Git Flow), Backend (Express + Bun) (+8 more)

### Community 40 - "Community 40"
Cohesion: 0.16
Nodes (10): LoginInput, RegisterInput, AuthController, controller, router, LoginInputSchema, RegisterInputSchema, AuthService (+2 more)

### Community 41 - "Community 41"
Cohesion: 0.12
Nodes (15): compilerOptions, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, paths (+7 more)

### Community 42 - "Community 42"
Cohesion: 0.23
Nodes (13): useGetInfiniteLiveStockData(), useGetSettings(), useGetInfiniteStockData(), useGetSyncLogs(), useSyncHistorical(), useWebSocket(), IngestionLogsPage(), LiveScreenerPage() (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.28
Nodes (11): AiAnalysisCard(), AiAnalysisCardProps, ScoreRowProps, PositionSizingCalculator(), useGetAiAnalysis(), useRefreshAiAnalysis(), useGetCorporateActions(), useGetQuote() (+3 more)

### Community 45 - "Community 45"
Cohesion: 0.19
Nodes (10): requireAdmin(), SettingsController, controller, router, GetAiRecommendationInput, GetAiRecommendationSchema, UpdateScoringRulesBatchInput, UpdateScoringRulesBatchSchema (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.27
Nodes (8): SettingsProfile(), SettingsProfileProps, ProfilePage(), ProfileInput, ProfileSchema, ProfileState, CardFooter, Textarea()

### Community 47 - "Community 47"
Cohesion: 0.21
Nodes (10): StockChartCanvas(), StockChartCanvasProps, initialState, Theme, ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.26
Nodes (3): GeminiAdapter, decrypt(), SECRET_KEY

### Community 49 - "Community 49"
Cohesion: 0.21
Nodes (7): ScreenerSearchProps, Input, InputProps, CreateUserFormInput, CreateUserFormSchema, UpdateUserFormInput, UpdateUserFormSchema

### Community 50 - "Community 50"
Cohesion: 0.27
Nodes (6): QuoteDetailsProps, api, liveScreenerKeys, getLiveStockDataApi(), StockDataQueryParams, StockQuote

### Community 51 - "Community 51"
Cohesion: 0.23
Nodes (9): MetricCardBodyProps, MetricRow(), MetricRowProps, StrategyScoreCard(), StrategyScoreCardProps, useIsMobile(), HoverCard(), HoverCardContent() (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.17
Nodes (11): 1. Architecture, 2. File & Folder Naming, 3. Suffix Wajib, 4. Code-Level Casing, 5. Design Patterns, 6. Path Alias, 7. Testing — Frontend, 8. Aturan QA (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.17
Nodes (11): 1. Architecture, 2. File & Folder Naming, 3. Suffix Wajib, 4. Code-Level Casing, 5. Design Patterns, 6. Path Alias, 7. Testing — Frontend, 8. Aturan QA (+3 more)

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (7): filePath, normalizedName, SCHEMA_INDEX_PATH, SCHEMAS_DIR, tableName, typeName, variableName

### Community 55 - "Community 55"
Cohesion: 0.27
Nodes (6): logger, requestLogger(), sanitizeLogValue(), StocksController, controller, router

### Community 56 - "Community 56"
Cohesion: 0.20
Nodes (6): CreateStockSchema, StockQueryInput, StockQuerySchema, SyncState, SyncStateSchema, UpdateStockSchema

### Community 57 - "Community 57"
Cohesion: 0.20
Nodes (9): 1. Architecture, 2. File Naming, 3. Code-Level Casing, 4. Design Pattern, 5. Layer Boundaries & Rules, 6. Testing — Backend, Alur Request (Request Lifecycle), Backend Guidelines (+1 more)

### Community 58 - "Community 58"
Cohesion: 0.29
Nodes (6): GlobalErrorContainer(), beforeSend(), generateUUID(), ErrorState, StoredError, useErrorStore

### Community 59 - "Community 59"
Cohesion: 0.33
Nodes (6): InfoPresenter(), useGetInfo(), infoKeys, InfoLandingPage(), fetchTechStackInfo(), triggerBackendSentryTest()

### Community 60 - "Community 60"
Cohesion: 0.20
Nodes (9): 1. Architecture, 2. File Naming, 3. Code-Level Casing, 4. Design Pattern, 5. Layer Boundaries & Rules, 6. Testing — Backend, Alur Request (Request Lifecycle), Backend Guidelines (+1 more)

### Community 61 - "Community 61"
Cohesion: 0.29
Nodes (4): UpdateSettingsInput, MASTER_EXCHANGES, SettingsService, encrypt()

### Community 62 - "Community 62"
Cohesion: 0.22
Nodes (8): authRoutes, backtestRoutes, liveScreenerRoutes, v1Router, screenerRoutes, settingsRoutes, stocksRoutes, userManagementRoutes

### Community 64 - "Community 64"
Cohesion: 0.25
Nodes (7): LoginForm(), RegisterForm(), SettingsForm(), StockFormDialog(), UserFormDialog(), useGetAiScreenerRecommendation(), useSyncExchanges()

### Community 66 - "Community 66"
Cohesion: 0.32
Nodes (4): aiAnalyses, AiAnalysis, NewAiAnalysis, AiAnalysisRepository

### Community 69 - "Community 69"
Cohesion: 0.25
Nodes (7): Admonitions, Code Blocks, Front Matter, Images, Links, Markdown Features, MDX and React Components

### Community 70 - "Community 70"
Cohesion: 0.29
Nodes (6): Add a Locale Dropdown, Build your localized site, Configure i18n, Start your localized site, Translate a doc, Translate your site

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (5): Build, Deployment, Installation, Local Development, Website

### Community 72 - "Community 72"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, type-check

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (3): NewSetting, Setting, settings

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (4): LoginInput, RegisterInput, LoginSchema, RegisterSchema

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (4): existingFiles, filePath, nextPrefix, SEEDERS_DIR

### Community 77 - "Community 77"
Cohesion: 0.60
Nodes (3): fail(), log(), deploy.sh script

### Community 78 - "Community 78"
Cohesion: 0.40
Nodes (4): Generate a new site, Getting Started, Start your site, Tutorial Intro

### Community 79 - "Community 79"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 80 - "Community 80"
Cohesion: 0.40
Nodes (4): Add a Version Dropdown, Create a docs version, Manage Docs Versions, Update an existing version

### Community 81 - "Community 81"
Cohesion: 0.50
Nodes (3): compilerOptions, baseUrl, extends

### Community 82 - "Community 82"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + TypeScript + Vite

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (3): BacktestReport, backtestReports, NewBacktestReport

### Community 84 - "Community 84"
Cohesion: 0.50
Nodes (3): ImportMeta, ImportMetaEnv, Window

### Community 85 - "Community 85"
Cohesion: 0.50
Nodes (3): Configure the Sidebar, Create a Document, Create your first Doc

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (3): Create a Page, Create your first Markdown Page, Create your first React Page

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (3): Build your site, Deploy your site, Deploy your site

## Knowledge Gaps
- **504 isolated node(s):** `name`, `version`, `private`, `main`, `dev` (+499 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `Community 40` to `Community 64`, `Community 19`?**
  _High betweenness centrality (0.201) - this node is a cross-community bridge._
- **Why does `cn()` connect `Community 8` to `Community 32`, `Community 33`, `Community 34`, `Community 2`, `Community 4`, `Community 9`, `Community 42`, `Community 46`, `Community 15`, `Community 49`, `Community 51`, `Community 20`, `Community 25`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `BacktestPage()` connect `Community 1` to `Community 64`, `Community 42`, `Community 5`, `Community 15`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _504 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09966777408637874 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07897793263646923 - nodes in this community are weakly interconnected._