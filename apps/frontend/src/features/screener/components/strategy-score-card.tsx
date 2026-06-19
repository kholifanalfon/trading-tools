import { useEffect, useState } from "react";
import { ActivityIcon, HelpCircleIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/shared/components/ui/hover-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";

// ─── useIsMobile ──────────────────────────────────────────────────────────────

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < breakpoint : false));
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

// ─── MetricCardBody ───────────────────────────────────────────────────────────
// Shared content rendered inside both HoverCard and Dialog

interface MetricCardBodyProps {
  label: string;
  briefDesc: string;
  detailedDesc: string;
  thresholds: string[];
}

function MetricCardBody({ label, briefDesc, detailedDesc, thresholds }: MetricCardBodyProps) {
  return (
    <>
      {/* Header accent */}
      <div className="bg-indigo-500/10 border-b border-border/50 px-3 py-2 -mx-3 -mt-3 mb-3 rounded-t-lg">
        <p className="text-[12px] font-bold text-foreground leading-snug">{label}</p>
        <p className="text-[10px] text-indigo-400/90 font-medium leading-tight mt-1">{briefDesc}</p>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{detailedDesc}</p>
      <div className="space-y-1 border-t border-border/40 pt-2 mt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 block">Kriteria Scoring</span>
        <ul className="space-y-0.5">
          {thresholds.map((t, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-[10px] font-mono text-muted-foreground leading-snug">
              <span className="mt-px text-indigo-400/70 shrink-0">›</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ─── MetricRow ────────────────────────────────────────────────────────────────
// Desktop → HoverCard | Mobile → Dialog

interface MetricRowProps {
  metricKey: string;
  label: string;
  score: number;
  maxScore: number;
  briefDesc: string;
  detailedDesc: string;
  thresholds: string[];
  actualValueText?: string;
  getBarColor: (s: number) => string;
  scoreText?: string;
}

function MetricRow({ metricKey, label, score, maxScore, briefDesc, detailedDesc, thresholds, actualValueText, getBarColor, scoreText }: MetricRowProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const trigger = (
    <span key={metricKey} className="text-muted-foreground font-semibold flex items-center gap-1 cursor-pointer select-none" onClick={() => isMobile && setOpen(true)}>
      {label}
      <HelpCircleIcon className={`h-3 w-3 shrink-0 transition-colors ${open ? "text-indigo-400" : "text-muted-foreground/40 hover:text-indigo-400"}`} />
    </span>
  );

  return (
    <div className="flex flex-col flex-1 gap-1 border-b border-border/20 pb-2 last:border-0 last:pb-0">
      <div className="flex justify-between items-center font-mono text-[10px]">
        {/* ── Desktop: HoverCard ── */}
        {!isMobile && (
          <HoverCard open={open} onOpenChange={setOpen} openDelay={150} closeDelay={80}>
            <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
            <HoverCardContent side="left" align="start" className="w-72 p-3 overflow-hidden">
              <MetricCardBody label={label} briefDesc={briefDesc} detailedDesc={detailedDesc} thresholds={thresholds} />
            </HoverCardContent>
          </HoverCard>
        )}

        {/* ── Mobile: plain trigger + Dialog ── */}
        {isMobile && trigger}

        <div className="flex items-center gap-1.5 text-end">
          <span className="font-bold text-foreground">{scoreText ? scoreText : `${score} / ${maxScore}`}</span>
        </div>
      </div>

      <div className="w-full bg-muted/35 rounded-full h-1 overflow-hidden">
        <div className={`h-full ${getBarColor(score)}`} style={{ width: `${(score / maxScore) * 100}%` }}></div>
      </div>

      {actualValueText && <span className="w-fit text-[9px] bg-muted/40 text-muted-foreground px-2 pt-1 pb-0.5 rounded font-mono font-medium">{actualValueText}</span>}

      {/* ── Mobile Dialog ── */}
      {isMobile && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-sm p-3 gap-0 !my-0">
            <DialogHeader className="sr-only">
              <DialogTitle>{label}</DialogTitle>
              <DialogDescription>{briefDesc}</DialogDescription>
            </DialogHeader>
            <MetricCardBody label={label} briefDesc={briefDesc} detailedDesc={detailedDesc} thresholds={thresholds} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── StrategyScoreCard ────────────────────────────────────────────────────────

export interface StrategyScoreCardProps {
  scorePayload: any;
  date: string | null;
  activeScoreTab: "day" | "swing" | "position";
  setActiveScoreTab: (tab: "day" | "swing" | "position") => void;
  metrics?: any;
}

export function StrategyScoreCard({ scorePayload, date, activeScoreTab, setActiveScoreTab, metrics }: StrategyScoreCardProps) {
  if (!scorePayload) return null;

  const getScoreColor = (score: number, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (percentage >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getBarColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  /** Thin wrapper so call-sites stay concise */
  const row = (
    key: string,
    label: string,
    score: number,
    maxScore: number,
    briefDesc: string,
    detailedDesc: string,
    thresholds: string[],
    actualValueText?: string,
    scoreText?: string,
  ) => (
    <MetricRow
      key={key}
      metricKey={key}
      label={label}
      score={score}
      maxScore={maxScore}
      briefDesc={briefDesc}
      detailedDesc={detailedDesc}
      thresholds={thresholds}
      actualValueText={actualValueText}
      getBarColor={(s) => getBarColor(s, maxScore)}
      scoreText={scoreText}
    />
  );

  return (
    <div className="bg-card/45 border border-border p-4 rounded-xl space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <ActivityIcon className="h-3.5 w-3.5 text-indigo-400" />
          Strategy Score Breakdown
        </h3>
        <div className="text-[10px] text-muted-foreground font-semibold font-mono">
          {date &&
            new Date(date).toLocaleDateString("id-ID", {
              month: "short",
              day: "numeric",
            })}
        </div>
      </div>

      {/* Tabs for activeScoreTab */}
      <div className="grid grid-cols-3 gap-1 bg-muted/30 p-0.5 rounded-lg border border-border/30">
        {(["day", "swing", "position"] as const).map((tab) => {
          const isActive = activeScoreTab === tab;
          const label = tab === "day" ? "Day" : tab === "swing" ? "Swing" : "Position";
          return (
            <button
              key={tab}
              onClick={() => setActiveScoreTab(tab)}
              className={`py-1 text-[10px] font-bold rounded transition-all duration-200 capitalize ${
                isActive ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted/20"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Score content based on tab */}
      {(() => {
        if (activeScoreTab === "day" && scorePayload.dayScore) {
          const d = scorePayload.dayScore;
          // Calculate max score dynamically based on active rules
          let dayMaxScore = 35 + 25 + 15 + 15 + 10; // base parameters
          if (d.bbBounce !== undefined) dayMaxScore += 15;
          if (d.priceAboveVwap !== undefined) dayMaxScore += 20;
          if (d.zscoreExtreme !== undefined) dayMaxScore += 20;
          if (d.adLineUptrend !== undefined) dayMaxScore += 15;

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-muted/10 p-2 rounded-lg border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Total Day Score</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded border font-mono ${getScoreColor(d.total, dayMaxScore)}`}>
                  {d.total} / {dayMaxScore}
                </span>
              </div>

              <div className="space-y-2.5 text-[11px]">
                {row(
                  "day_rvol",
                  "Relative Volume (RVOL)",
                  d.rvol,
                  35,
                  "Volume saat ini dibanding rata-rata (lonjakan mengonfirmasi breakout).",
                  "Mengukur rasio volume perdagangan saat ini dibandingkan rata-rata historis (rata-rata 10 atau 20 hari). Lonjakan volume mengonfirmasi minat institusional/ritel yang tinggi untuk mendukung kelanjutan tren atau breakout.",
                  ["RVOL > 2.0 = 35 poin", "RVOL > 1.5 = 25 poin", "RVOL > 1.0 = 15 poin", "RVOL <= 1.0 = 0 poin"],
                  metrics?.volume ? `Vol: ${metrics.volume.toLocaleString()}` : undefined,
                )}

                {row(
                  "day_atr",
                  "Volatility (ATR %)",
                  d.atr,
                  25,
                  "Lebar rentang harga harian dibanding harga tutup (mengukur potensi swing harian).",
                  "Average True Range dalam bentuk persentase terhadap harga saat ini. Menunjukkan fluktuasi pergerakan harga harian untuk memastikan saham memiliki ruang gerak yang cukup untuk day trading.",
                  ["ATR % > 5.0% = 25 poin", "ATR % > 3.0% = 15 poin", "ATR % <= 3.0% = 0 poin"],
                  metrics?.close && metrics?.high && metrics?.low ? `Range: ${(((metrics.high - metrics.low) / metrics.close) * 100).toFixed(2)}%` : undefined,
                )}

                {row(
                  "day_gap",
                  "Gap %",
                  d.gap,
                  15,
                  "Lonjakan harga pembukaan dibanding harga penutupan kemarin.",
                  "Selisih persentase antara harga pembukaan hari ini dengan harga penutupan kemarin. Menunjukkan adanya katalis berita atau sentimen semalam (overnight).",
                  ["Gap > 2.0% atau < -2.0% = 15 poin", "Gap > 1.0% atau < -1.0% = 10 poin", "Lainnya = 0 poin"],
                  metrics?.changePercent ? `Gap: ${metrics.changePercent.toFixed(2)}%` : undefined,
                )}

                {row(
                  "day_rsi",
                  "Momentum (RSI 14)",
                  d.rsi,
                  15,
                  "Mendeteksi kejenuhan tren harga (Overbought > 60 atau Oversold < 30).",
                  "Relative Strength Index 14 periode untuk mendeteksi kejenuhan tren harga.",
                  ["RSI > 60 (Overbought / Bullish): 15 poin", "RSI < 30 (Oversold / Rebound): 15 poin", "Lainnya = 0 poin"],
                  metrics?.rsi ? `RSI: ${metrics.rsi.toFixed(2)}` : undefined,
                )}

                {row(
                  "day_liquidity",
                  "Liquidity",
                  d.liquidity,
                  10,
                  "Menjamin saham memiliki transaksi harian yang cukup untuk menghindari slippage.",
                  "Likuiditas diukur dari volume perdagangan harian untuk memastikan kemudahan masuk dan keluar posisi tanpa slippage besar.",
                  ["Rata-rata Volume > 1.000.000 = 10 poin", "Rata-rata Volume > 500.000 = 5 poin", "Lainnya = 0 poin"],
                )}

                {d.bbBounce !== undefined &&
                  row(
                    "day_bbBounce",
                    "BB Lower Bounce",
                    d.bbBounce,
                    15,
                    "Pantulan harga dari batas pita bawah Bollinger Bands (indikasi rebound).",
                    "Pantulan harga dari batas pita bawah Bollinger Bands. Ini menunjukkan harga telah menyentuh batas deviasi bawah dan berpotensi memantul naik kembali.",
                    ["Pantulan terdeteksi (Harga mendekati BB Lower & memantul) = 15 poin (Bonus)", "Tidak terdeteksi = 0 poin"],
                  )}

                {d.priceAboveVwap !== undefined &&
                  row(
                    "day_vwap",
                    "Price Above VWAP",
                    d.priceAboveVwap,
                    20,
                    "Harga di atas rata-rata tertimbang volume (biasa dicari pembeli institusional).",
                    "Volume Weighted Average Price (VWAP) digunakan sebagai referensi harga rata-rata institusi. Harga penutupan di atas VWAP menandakan pembeli memegang kendali penuh.",
                    ["Harga > VWAP = 20 poin (Bonus)", "Harga <= VWAP = 0 poin"],
                    metrics?.vwap ? `VWAP: ${metrics.vwap.toFixed(2)}` : undefined,
                  )}

                {d.zscoreExtreme !== undefined &&
                  row(
                    "day_zscore",
                    "Z-Score Extreme Reversal",
                    d.zscoreExtreme,
                    20,
                    "Mengukur deviasi ekstrem dari harga rata-rata historis (potensi mean reversion).",
                    "Mengukur deviasi standar harga saat ini dari harga rata-rata historisnya. Z-Score ekstrem menunjukkan kondisi harga jenuh (extreme) yang siap berbalik arah (mean reversion).",
                    ["Absolute Z-Score >= 2.5 = 20 poin (Bonus)", "Absolute Z-Score < 2.5 = 0 poin"],
                    metrics?.zScore ? `Z-Score: ${metrics.zScore.toFixed(2)}` : undefined,
                  )}

                {d.adLineUptrend !== undefined &&
                  row(
                    "day_adLine",
                    "A/D Line Uptrend (CVD Proxy)",
                    d.adLineUptrend,
                    15,
                    "Indikasi akumulasi volume beli tersembunyi (proksi data CVD).",
                    "Menggunakan pergerakan Accumulation/Distribution Line sebagai proksi Cumulative Volume Delta (CVD) untuk melacak apakah sedang terjadi akumulasi beli tersembunyi.",
                    ["Money Flow Multiplier positif (> 0) = 15 poin (Bonus)", "Lainnya = 0 poin"],
                  )}
              </div>
            </div>
          );
        }

        if (activeScoreTab === "swing" && scorePayload.swingScore) {
          const s = scorePayload.swingScore;
          // Calculate max score dynamically based on active rules
          let swingMaxScore = 35 + 25 + 20 + 10 + 10; // base parameters: Trend (35), MACD (25), RSI (20), Volume (10), Proximity (10)
          if (s.macdGoldenCross !== undefined) swingMaxScore += 20;
          if (s.adxStrongTrend !== undefined) swingMaxScore += 15;
          if (s.vwapDeviationExhaustion !== undefined) swingMaxScore += 10;

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-muted/10 p-2 rounded-lg border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Total Swing Score</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded border font-mono ${getScoreColor(s.total, swingMaxScore)}`}>
                  {s.total} / {swingMaxScore}
                </span>
              </div>

              <div className="space-y-2.5 text-[11px]">
                {row(
                  "swing_trend",
                  "Trend Alignment",
                  s.trend,
                  35,
                  "Tren harga berada di atas EMA 21 dan EMA 21 > EMA 50.",
                  "Memastikan arah tren jangka menengah sejalan dengan kenaikan harga untuk perdagangan swing.",
                  ["Harga Penutupan > EMA 21 = 15 poin", "EMA 21 > EMA 50 = 20 poin", "Total Maksimal = 35 poin"],
                  metrics?.close && metrics?.ema21 ? `Close: ${metrics.close.toFixed(2)} | EMA21: ${metrics.ema21.toFixed(2)}` : undefined,
                )}

                {row(
                  "swing_macd",
                  "MACD Setup",
                  s.macd,
                  25,
                  "Garis MACD berada di atas garis sinyal dengan histogram bernilai positif.",
                  "Mengukur kekuatan momentum tren jangka menengah menggunakan indikator MACD.",
                  ["Histogram MACD Positif (> 0) = 10 poin", "Garis MACD > Garis Sinyal = 15 poin", "Total Maksimal = 25 poin"],
                  metrics?.macd !== undefined && metrics?.macdSignal !== undefined ? `MACD: ${metrics.macd?.toFixed(2)} | Sig: ${metrics.macdSignal?.toFixed(2)}` : undefined,
                )}

                {row(
                  "swing_rsi",
                  "RSI Setup",
                  s.rsi,
                  20,
                  "RSI berada di zona aman (40-65) yang cocok untuk pola swing.",
                  "Mengidentifikasi rentang RSI ideal untuk swing trading di mana momentum kuat tetapi harga belum mengalami jenuh beli (overbought).",
                  ["RSI antara 40 dan 65 = 20 poin", "RSI antara 65 dan 70 = 10 poin", "Lainnya = 0 poin"],
                  metrics?.rsi ? `RSI: ${metrics.rsi.toFixed(2)}` : undefined,
                )}

                {row(
                  "swing_volume",
                  "Volume Trend",
                  s.volume,
                  10,
                  "Peningkatan volume di atas rata-rata 20 hari saat harga naik.",
                  "Volume perdagangan harian harus lebih tinggi dari rata-rata 20 hari pada hari kenaikan harga untuk mengonfirmasi partisipasi kuat dari buyer.",
                  ["Volume > Rata-rata 20 Hari & Harga Naik = 10 poin", "Lainnya = 0 poin"],
                )}

                {row(
                  "swing_proximity",
                  "Proximity",
                  s.proximity,
                  10,
                  "Kedekatan harga saat ini dengan EMA 21 (mencari titik pantul support).",
                  "Mengukur kedekatan harga penutupan dengan support dinamis EMA 21 untuk mendapatkan entri pullback berisiko rendah.",
                  ["Selisih harga dengan EMA 21 < 2% = 10 poin", "Lainnya = 0 poin"],
                )}

                {s.macdGoldenCross !== undefined &&
                  row(
                    "swing_macdGC",
                    "MACD Golden Cross",
                    s.macdGoldenCross,
                    20,
                    "Konfirmasi beli saat garis MACD memotong ke atas garis sinyal.",
                    "Sinyal beli kuat saat garis MACD melintas ke atas garis sinyal (Golden Cross) yang menunjukkan peralihan momentum ke arah bullish.",
                    ["Terjadi Golden Cross hari ini = 20 poin (Bonus)", "Tidak terjadi = 0 poin"],
                  )}

                {s.adxStrongTrend !== undefined &&
                  row(
                    "swing_adx",
                    "ADX Strong Trend (>25)",
                    s.adxStrongTrend,
                    15,
                    "Tren dianggap kuat dan layak diikuti jika ADX berada di atas 25.",
                    "Average Directional Index (ADX) mengukur kekuatan tren tanpa memandang arah bullish/bearish. Nilai di atas 25 menunjukkan tren yang kuat.",
                    ["ADX > 25.0 = 15 poin (Bonus)", "ADX <= 25.0 = 0 poin"],
                    metrics?.adx ? `ADX: ${metrics.adx.toFixed(2)}` : undefined,
                  )}

                {s.vwapDeviationExhaustion !== undefined &&
                  row(
                    "swing_vwapExhaustion",
                    "VWAP Dev Exhaustion",
                    s.vwapDeviationExhaustion,
                    10,
                    "Tren mendekati kelelahan (exhaustion) jika harga menyentuh deviasi VWAP ke-2/3.",
                    "Mengidentifikasi kelelahan tren swing ketika harga menyimpang sangat jauh (lebih dari 2 standar deviasi) dari rata-rata VWAP jangka panjang.",
                    ["Absolute Z-Score >= 2.0 (Exhaustion) = 10 poin (Bonus)", "Absolute Z-Score < 2.0 = 0 poin"],
                  )}
              </div>
            </div>
          );
        }

        if (activeScoreTab === "position" && scorePayload.positionScore) {
          const p = scorePayload.positionScore;
          // Calculate max score dynamically based on active rules
          let positionMaxScore = 40 + 25 + 20 + 15; // base parameters: Trend (40), Strength (25), Momentum (20), Volatility (15)
          if (p.pocPullbackProximity !== undefined) positionMaxScore += 20;
          if (p.rvolBreakoutConfirm !== undefined) positionMaxScore += 15;

          return (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-muted/10 p-2 rounded-lg border border-border/40">
                <span className="text-xs font-semibold text-muted-foreground">Total Position Score</span>
                <span className={`text-xs font-extrabold px-2 py-0.5 rounded border font-mono ${getScoreColor(p.total, positionMaxScore)}`}>
                  {p.total} / {positionMaxScore}
                </span>
              </div>

              <div className="space-y-2.5 text-[11px]">
                {row(
                  "pos_trend",
                  "Long-Term Trend",
                  p.trend,
                  40,
                  "Harga berada di atas SMA 200 dengan posisi SMA 50 > SMA 200.",
                  "Memastikan arah tren jangka panjang berada dalam fase bullish yang stabil untuk hold posisi jangka menengah/panjang.",
                  ["Harga Penutupan > SMA 200 = 15 poin", "SMA 50 > SMA 200 (Golden Cross) = 25 poin", "Total Maksimal = 40 poin"],
                )}

                {row(
                  "pos_strength",
                  "Price Strength (52W High)",
                  p.priceStrength,
                  25,
                  "Melihat seberapa dekat harga saat ini dengan harga tertinggi 52 minggu.",
                  "Mengukur tingkat kekuatan harga (relative strength). Saham yang mendekati harga tertinggi 52 minggu menunjukkan minat beli yang persisten dan kuat.",
                  ["Harga saat ini berada dalam selisih <= 10% dari 52W High = 25 poin", "Lainnya = 0 poin"],
                )}

                {row(
                  "pos_momentum",
                  "Long-term Momentum",
                  p.momentum,
                  20,
                  "Imbal hasil historis 1 tahun terakhir bernilai positif (>10%).",
                  "Kinerja historis pengembalian harga (return) selama 1 tahun terakhir untuk memastikan momentum bullish jangka panjang yang solid.",
                  ["Return 1 Tahun > 20% = 20 poin", "Return 1 Tahun > 10% = 10 poin", "Lainnya = 0 poin"],
                )}

                {row(
                  "pos_volatility",
                  "Low Volatility",
                  p.volatility,
                  15,
                  "Menyukai volatilitas rendah demi kenaikan harga jangka panjang yang stabil.",
                  "Menyukai saham dengan volatilitas rendah yang naik secara stabil untuk meminimalkan risiko kepanikan jual saat hold posisi jangka panjang.",
                  ["ATR % < 3.0% = 15 poin", "ATR % < 5.0% = 5 poin", "ATR % >= 5.0% = 0 poin"],
                )}

                {p.pocPullbackProximity !== undefined &&
                  row(
                    "pos_poc",
                    "POC Pullback Proximity",
                    p.pocPullbackProximity,
                    20,
                    "Kecenderungan harga ditarik mendekati area transaksi terbesar (POC).",
                    "Mengukur kedekatan harga dengan Point of Control (POC) Volume Profile, yaitu area dengan volume transaksi terbesar historis, yang bertindak sebagai support kuat jangka panjang.",
                    ["Selisih harga dengan POC <= 5% = 20 poin (Bonus)", "Lainnya = 0 poin"],
                  )}

                {p.rvolBreakoutConfirm !== undefined &&
                  row(
                    "pos_rvolConfirm",
                    "RVOL Breakout Confirm",
                    p.rvolBreakoutConfirm,
                    15,
                    "Konfirmasi breakout harga menggunakan volume yang tinggi (> 1.5x rata-rata).",
                    "Mengonfirmasi bahwa breakout/akumulasi didukung oleh volume besar jangka panjang (> 1.5x rata-rata volume).",
                    ["RVOL > 1.5 = 15 poin (Bonus)", "RVOL <= 1.5 = 0 poin"],
                    metrics?.volume ? `Vol: ${metrics.volume.toLocaleString()}` : undefined,
                  )}
              </div>
            </div>
          );
        }

        return <div className="text-xs text-muted-foreground italic text-center py-2">Tidak ada data score breakdown.</div>;
      })()}

      {/* Risk Validation Section */}
      {(() => {
        const rv = scorePayload.riskValidation ? scorePayload.riskValidation[activeScoreTab] || scorePayload.riskValidation : null;
        if (!rv) return null;

        // Custom config labels for tooltip/helper info based on active tab
        const configLabels = {
          day: { sl: "1.0x ATR", tp: "2.0x ATR", min: "1.5 : 1" },
          swing: { sl: "2.0x ATR", tp: "6.0x ATR", min: "2.0 : 1" },
          position: { sl: "3.0x ATR", tp: "15.0x ATR", min: "5.0 : 1" },
        }[activeScoreTab] || { sl: "1.0x ATR", tp: "2.0x ATR", min: "1.5 : 1" };

        return (
          <div className="border-t border-border/40 pt-3 mt-4 space-y-2 text-xs">
            <div className="flex gap-2 justify-between items-center font-mono">
              {row(
                "risk_rr_validation",
                `Risk Validation`,
                rv.passed ? 1 : 0,
                1,
                "Validasi rasio potensi keuntungan dibanding risiko sebelum masuk posisi.",
                "Sistem mengevaluasi apakah potensi keuntungan (Reward) setidaknya sebanding dengan batas minimum rasio risiko (Risk) berdasarkan stop loss dan target profit strategi.",
                [
                  `Minimum Ratio: ${configLabels.min}`,
                  `Stop Loss: ${configLabels.sl} di bawah harga penutupan`,
                  `Target Profit: ${configLabels.tp} di atas harga penutupan`,
                  rv.passed
                    ? "Hasil: Memenuhi syarat minimum R:R"
                    : `Hasil: Rasio (${rv.rewardRiskRatio?.toFixed(2)}) di bawah target minimum ${configLabels.min.split(" ")[0]} (RISK VIOLATION)`,
                ],
                undefined,
                "",
              )}
            </div>
            <div className="flex flex-col gap-2 text-[10px] font-mono">
              <div className="flex justify-between border-b border-border/30 pb-0.5">
                <span className="text-muted-foreground">Stop Loss:</span>
                <span className="font-bold text-red-500">{rv.stopLoss?.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-0.5">
                <span className="text-muted-foreground">Target Profit:</span>
                <span className="font-bold text-green-500">{rv.targetProfit?.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-0.5">
                <span className="text-muted-foreground">Reward-to-Risk Ratio:</span>
                <span className={`font-bold ${rv.passed ? "text-indigo-400" : "text-red-500"}`}>{rv.rewardRiskRatio?.toFixed(2)} : 1</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-0.5">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 font-mono ${rv.passed ? "text-green-500 bg-green-500/10 border-green-500/20" : "text-red-500 bg-red-500/10 border-red-500/20"}`}
                >
                  {rv.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              {!rv.passed && (
                <div className="bg-red-500/5 border border-red-500/20 rounded p-1.5 text-[9px] text-red-400 mt-1 leading-normal">
                  <span className="font-bold uppercase block text-[8px] tracking-wider mb-0.5">⚠️ Risk Violation Terdeteksi:</span>
                  Rasio R:R saat ini yaitu {rv.rewardRiskRatio?.toFixed(2)} : 1 berada di bawah batas minimum yang aman untuk strategi {activeScoreTab} ({configLabels.min}).
                  Perdagangan tidak direkomendasikan karena risiko kerugian tidak sebanding dengan potensi target profit teknikal.
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
