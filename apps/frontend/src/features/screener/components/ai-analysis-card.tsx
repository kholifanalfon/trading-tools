import { useState } from "react";
import { SparklesIcon, RefreshCwIcon, AlertTriangleIcon, InfoIcon, AwardIcon, CheckCircle2Icon, XCircleIcon, MinusCircleIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useGetAiAnalysis, useRefreshAiAnalysis } from "../hooks/use-ai-analysis";
import { marked } from "marked";

interface AiAnalysisCardProps {
  symbol: string;
  isProcessing?: boolean;
}

export function AiAnalysisCard({ symbol, isProcessing }: AiAnalysisCardProps) {
  const { data: analysis, isLoading } = useGetAiAnalysis(symbol);
  const { mutate: refreshAnalysis, isPending } = useRefreshAiAnalysis(symbol);
  const [activeTab, setActiveTab] = useState<"detail" | "comparison" | "macro">("detail");

  const getVerdictBadge = (verdict: string | null | undefined) => {
    const v = (verdict || "").toUpperCase();
    if (v === "AGREE") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          <CheckCircle2Icon className="h-3.5 w-3.5" />
          AI Setuju dengan Sistem
        </span>
      );
    }
    if (v === "DISAGREE") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/25">
          <XCircleIcon className="h-3.5 w-3.5" />
          AI Tidak Setuju dengan Sistem
        </span>
      );
    }
    if (v === "PARTIAL") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          <MinusCircleIcon className="h-3.5 w-3.5" />
          AI Sebagian Setuju
        </span>
      );
    }
    return null;
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score == null) return "text-muted-foreground";
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreBarColor = (score: number | null | undefined) => {
    if (score == null) return "bg-muted/40";
    if (score >= 70) return "bg-gradient-to-r from-emerald-600 to-emerald-400";
    if (score >= 40) return "bg-gradient-to-r from-amber-600 to-amber-400";
    return "bg-gradient-to-r from-red-600 to-red-400";
  };

  const getDiffLabel = (ai: number | null | undefined, sys: number | null | undefined) => {
    if (ai == null || sys == null) return null;
    const diff = Math.round(ai - sys);
    if (diff === 0) return <span className="text-muted-foreground text-[9px]">±0</span>;
    if (diff > 0) return <span className="text-emerald-400 text-[9px]">+{diff}</span>;
    return <span className="text-red-400 text-[9px]">{diff}</span>;
  };

  const formatMarkdown = (text: string) => {
    if (!text) return "";
    try {
      return marked.parse(text) as string;
    } catch {
      return text;
    }
  };

  if (isLoading || isPending || isProcessing) {
    return (
      <div className="bg-card/45 border border-border p-6 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="p-4 rounded-full bg-indigo-500/5 border border-indigo-500/10 animate-pulse">
          <SparklesIcon className="h-10 w-10 text-indigo-400 animate-bounce" />
        </div>
        <div className="space-y-2 text-center w-full max-w-xs animate-pulse">
          <h3 className="text-sm font-bold text-foreground">AI Sedang Menganalisis</h3>
          <p className="text-[11px] text-muted-foreground">Mengekstrak data teknikal, menghitung performa strategi, dan menganalisis kondisi makro...</p>
          <div className="pt-2 flex flex-col items-center gap-1.5">
            <div className="h-2 w-32 bg-indigo-500/20 rounded"></div>
            <div className="h-1.5 w-48 bg-indigo-500/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const hasAnalysis = !!analysis;

  // System scores (from DB analysis context, stored at analysis time)
  const sysDayScore = analysis?.sysDayScore;
  const sysSwingScore = analysis?.sysSwingScore;
  const sysPosScore = analysis?.sysPosScore;

  return (
    <div className="bg-card/45 backdrop-blur-md rounded-xl border border-border/80 p-5 md:p-6 shadow-md flex flex-col space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-y-5 md:gap-y-0 justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-md font-bold text-foreground">AI Strategic Analysis</h2>
            <p className="text-[11px] text-muted-foreground">Generative financial intelligence from Gemini based on tech metrics & macro factors</p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => refreshAnalysis()}
          className="h-8 px-3 w-full md:w-auto text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition"
        >
          <RefreshCwIcon className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
          {isPending ? "Analyzing..." : hasAnalysis ? "Perbarui Analisis" : "Mulai Analisis"}
        </Button>
      </div>

      {!hasAnalysis ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <InfoIcon className="h-8 w-8 text-muted-foreground/60" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Belum Ada Analisis AI</h3>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Tekan tombol "Mulai Analisis" di atas untuk meminta AI menganalisis kondisi grafik dan ekonomi makro saham ini.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto w-full border-b border-border/80 scrollbar-thin whitespace-nowrap">
            <button
              onClick={() => setActiveTab("detail")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "detail" ? "border-indigo-500 text-indigo-400 font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <InfoIcon className="h-3.5 w-3.5" />
              Detail Grafik & Prediksi
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "comparison" ? "border-indigo-500 text-indigo-400 font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <AwardIcon className="h-3.5 w-3.5" />
              Perbandingan Skor
            </button>
            <button
              onClick={() => setActiveTab("macro")}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition -mb-px flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "macro" ? "border-indigo-500 text-indigo-400 font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangleIcon className="h-3.5 w-3.5" />
              Ekonomi Makro
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="min-w-0 w-full">
            {activeTab === "detail" && (
              <div
                className="prose prose-invert prose-xs max-w-none space-y-2 text-xs text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.analysisDetail) }}
              />
            )}

            {activeTab === "comparison" && (
              <div className="space-y-4">
                {/* Verdict Banner */}
                {analysis.scoreVerdict && (
                  <div className="flex items-center justify-between bg-background/40 border border-border/60 rounded-lg px-4 py-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Verdict AI</span>
                    {getVerdictBadge(analysis.scoreVerdict)}
                  </div>
                )}

                {/* Score Comparison Table */}
                {(analysis.aiDayScore != null || analysis.aiSwingScore != null || analysis.aiPositionScore != null) && (
                  <div className="bg-background/30 border border-border/50 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-4 gap-0 border-b border-border/50 bg-muted/10">
                      <div className="px-3 py-2 text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Strategi</div>
                      <div className="px-3 py-2 text-[9px] uppercase tracking-wider text-muted-foreground font-bold text-center">Sistem</div>
                      <div className="px-3 py-2 text-[9px] uppercase tracking-wider text-indigo-400 font-bold text-center">AI Score</div>
                      <div className="px-3 py-2 text-[9px] uppercase tracking-wider text-muted-foreground font-bold text-center">Selisih</div>
                    </div>

                    {/* Day Trading Row */}
                    <ScoreRow
                      label="Day Trading"
                      systemScore={sysDayScore}
                      aiScore={analysis.aiDayScore}
                      getDiffLabel={getDiffLabel}
                      getScoreColor={getScoreColor}
                      getScoreBarColor={getScoreBarColor}
                    />

                    {/* Swing Trading Row */}
                    <ScoreRow
                      label="Swing Trading"
                      systemScore={sysSwingScore}
                      aiScore={analysis.aiSwingScore}
                      getDiffLabel={getDiffLabel}
                      getScoreColor={getScoreColor}
                      getScoreBarColor={getScoreBarColor}
                    />

                    {/* Position Trading Row */}
                    <ScoreRow
                      label="Position Trading"
                      systemScore={sysPosScore}
                      aiScore={analysis.aiPositionScore}
                      getDiffLabel={getDiffLabel}
                      getScoreColor={getScoreColor}
                      getScoreBarColor={getScoreBarColor}
                      isLast
                    />
                  </div>
                )}

                {/* Detailed Comparison Text */}
                <div
                  className="prose prose-invert prose-xs max-w-none text-xs text-muted-foreground leading-relaxed space-y-2"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.scoreComparison) }}
                />
              </div>
            )}

            {activeTab === "macro" && (
              <div
                className="prose prose-invert prose-xs max-w-none space-y-2 text-xs text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(analysis.macroEconomics) }}
              />
            )}
          </div>

          {/* Footer Metadata */}
          <div className="text-[9px] text-muted-foreground border-t border-border/50 pt-2 flex items-center justify-between font-mono">
            <span>Model: Gemini AI Active</span>
            <span>
              Diperbarui pada:{" "}
              {new Date(analysis.updatedAt).toLocaleString("id-ID", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-component: Score Row ────────────────────────────────────────────────

interface ScoreRowProps {
  label: string;
  systemScore: number | null | undefined;
  aiScore: number | null | undefined;
  getDiffLabel: (ai: number | null | undefined, sys: number | null | undefined) => React.ReactNode;
  getScoreColor: (score: number | null | undefined) => string;
  getScoreBarColor: (score: number | null | undefined) => string;
  isLast?: boolean;
}

function ScoreRow({ label, systemScore, aiScore, getDiffLabel, getScoreColor, getScoreBarColor, isLast }: ScoreRowProps) {
  return (
    <div className={`grid grid-cols-4 gap-0 items-center ${!isLast ? "border-b border-border/40" : ""}`}>
      <div className="px-3 py-3">
        <span className="text-[10px] font-semibold text-foreground/80">{label}</span>
      </div>

      {/* System Score */}
      <div className="px-3 py-3 flex flex-col items-center gap-1">
        {systemScore != null ? (
          <>
            <span className={`text-xs font-bold font-mono ${getScoreColor(systemScore)}`}>{Math.round(systemScore)}</span>
            <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
              <div className={`h-full ${getScoreBarColor(systemScore)} rounded-full`} style={{ width: `${systemScore}%` }} />
            </div>
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">—</span>
        )}
      </div>

      {/* AI Score */}
      <div className="px-3 py-3 flex flex-col items-center gap-1">
        {aiScore != null ? (
          <>
            <span className={`text-xs font-bold font-mono ${getScoreColor(aiScore)}`}>{Math.round(aiScore)}</span>
            <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
              <div className={`h-full ${getScoreBarColor(aiScore)} rounded-full`} style={{ width: `${aiScore}%` }} />
            </div>
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground/50">—</span>
        )}
      </div>

      {/* Diff */}
      <div className="px-3 py-3 flex items-center justify-center">
        <span className="font-mono font-bold text-[10px]">{getDiffLabel(aiScore, systemScore)}</span>
      </div>
    </div>
  );
}
