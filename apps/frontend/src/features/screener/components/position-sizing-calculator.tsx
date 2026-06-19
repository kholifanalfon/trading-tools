import { useState, useEffect } from "react";
import { CalculatorIcon, ArrowUpRightIcon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";

interface PositionSizingCalculatorProps {
  symbol: string;
  currentPrice: number;
  isOpen: boolean;
  onClose: () => void;
  defaultStopLoss?: number;
  defaultTargetProfit?: number;
}

export function PositionSizingCalculator({ symbol, currentPrice, isOpen, onClose, defaultStopLoss, defaultTargetProfit }: PositionSizingCalculatorProps) {
  const isIndonesian = symbol.toUpperCase().endsWith(".JK");
  const currencySymbol = isIndonesian ? "Rp" : "$";

  // State with localStorage persistence for capital
  const [accountBalance, setAccountBalance] = useState<number>(() => {
    const saved = localStorage.getItem("position_sizing_calculator_capital");
    if (saved) {
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return isIndonesian ? 100000000 : 10000;
  });

  const [riskPercentage, setRiskPercentage] = useState<number>(1);
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice || 0);
  const [stopLossPrice, setStopLossPrice] = useState<number>(0);
  const [targetProfitPrice, setTargetProfitPrice] = useState<number>(0);

  // Focus states for input fields to toggle formatting
  const [capitalFocus, setCapitalFocus] = useState(false);
  const [entryFocus, setEntryFocus] = useState(false);
  const [slFocus, setSlFocus] = useState(false);
  const [tpFocus, setTpFocus] = useState(false);

  // Save capital to localStorage on change
  useEffect(() => {
    localStorage.setItem("position_sizing_calculator_capital", accountBalance.toString());
  }, [accountBalance]);

  // Auto update entry, stop loss, and target profit
  useEffect(() => {
    if (currentPrice) {
      const roundedPrice = Math.round(currentPrice * 100) / 100;
      setEntryPrice(roundedPrice);
      
      let slVal = 0;
      if (defaultStopLoss && defaultStopLoss > 0) {
        slVal = Math.round(defaultStopLoss * 100) / 100;
      } else {
        slVal = isIndonesian ? Math.round(roundedPrice * 0.95) : Math.round(roundedPrice * 0.95 * 100) / 100;
      }
      setStopLossPrice(slVal);

      if (defaultTargetProfit && defaultTargetProfit > 0) {
        setTargetProfitPrice(Math.round(defaultTargetProfit * 100) / 100);
      } else {
        const slDiff = roundedPrice - slVal;
        const tpVal = roundedPrice + (slDiff > 0 ? slDiff * 2 : roundedPrice * 0.1); // Default 1:2 R:R
        setTargetProfitPrice(isIndonesian ? Math.round(tpVal) : Math.round(tpVal * 100) / 100);
      }
    }
  }, [currentPrice, defaultStopLoss, defaultTargetProfit, isIndonesian]);

  if (!isOpen) return null;

  // Calculations
  const riskAmount = accountBalance * (riskPercentage / 100);
  const stopLossDiff = entryPrice - stopLossPrice;
  const stopLossPercent = entryPrice > 0 ? (stopLossDiff / entryPrice) * 100 : 0;

  const shares = stopLossDiff > 0 ? Math.floor(riskAmount / stopLossDiff) : 0;
  const totalCost = shares * entryPrice; // This is the Nominal Position Size
  const accountLoadPercent = accountBalance > 0 ? (totalCost / accountBalance) * 100 : 0;
  const lots = isIndonesian ? Math.floor(shares / 100) : shares / 100;

  // Real Potential Loss & Profit
  const maxLoss = shares * (stopLossDiff > 0 ? stopLossDiff : 0);
  const maxProfit = targetProfitPrice > entryPrice ? shares * (targetProfitPrice - entryPrice) : 0;
  const rewardRiskRatio = stopLossDiff > 0 && targetProfitPrice > entryPrice
    ? (targetProfitPrice - entryPrice) / stopLossDiff
    : 0;

  const profitPercentageOfCapital = accountBalance > 0 ? (maxProfit / accountBalance) * 100 : 0;
  const lossPercentageOfCapital = accountBalance > 0 ? (maxLoss / accountBalance) * 100 : 0;

  // Preset Stop Loss buttons helper
  const applySlPreset = (percent: number) => {
    if (entryPrice) {
      const calculatedSl = entryPrice * (1 - percent / 100);
      setStopLossPrice(isIndonesian ? Math.round(calculatedSl) : Math.round(calculatedSl * 100) / 100);
    }
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border border-border shadow-2xl rounded-2xl flex flex-col max-h-[90vh] bg-card gap-0">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center gap-3 p-5 border-b border-border/60 bg-muted/10">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <CalculatorIcon className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className="text-sm font-bold text-foreground">Position Sizing Calculator</DialogTitle>
            <DialogDescription className="text-[10px] text-muted-foreground font-mono mt-0.5">
              Asset: {symbol} • Currency: {isIndonesian ? "IDR (Rupiah)" : "USD (Dollar)"}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Card Body */}
        <div className="p-4 overflow-y-auto space-y-5 custom-scrollbar flex-1 text-xs">
          {/* Account Balance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="capital" className="text-xs font-semibold text-muted-foreground">
                Account Capital / Balance
              </Label>
              <span className="font-mono text-foreground font-bold">
                {currencySymbol} {formatCurrency(accountBalance)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-mono font-bold select-none">{currencySymbol}</span>
              <Input
                id="capital"
                type={capitalFocus ? "number" : "text"}
                value={capitalFocus ? accountBalance || "" : formatCurrency(accountBalance)}
                onFocus={() => setCapitalFocus(true)}
                onBlur={() => {
                  setCapitalFocus(false);
                  setAccountBalance(Math.round(accountBalance * 100) / 100);
                }}
                onChange={(e) => setAccountBalance(Number(e.target.value))}
                className="pl-8 font-mono font-bold text-foreground focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          {/* Risk Percentage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold text-muted-foreground">Risk per Trade</Label>
              <span className="text-indigo-400 font-bold font-mono">
                {riskPercentage}% ({currencySymbol} {formatCurrency(riskAmount)})
              </span>
            </div>
            <div className="flex items-center gap-4 bg-muted/5 p-3 rounded-xl border border-border/40">
              <div className="flex-1">
                <Slider min={0.25} max={10} step={0.25} value={riskPercentage} onValueChange={setRiskPercentage} />
              </div>
              <div className="relative w-20 shrink-0">
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={riskPercentage}
                  onChange={(e) => setRiskPercentage(Number(e.target.value))}
                  className="pr-6 text-center font-mono font-bold focus-visible:ring-indigo-500 h-8 text-xs"
                />
                <span className="absolute right-2 top-2 text-[10px] text-muted-foreground font-bold font-mono">%</span>
              </div>
            </div>
          </div>

          {/* Entry, Stop Loss & Target Profit Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Entry Price */}
            <div className="space-y-2">
              <Label htmlFor="entryPrice" className="text-xs font-semibold text-muted-foreground">
                Entry Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">{currencySymbol}</span>
                <Input
                  id="entryPrice"
                  type={entryFocus ? "number" : "text"}
                  value={entryFocus ? entryPrice || "" : formatCurrency(entryPrice)}
                  onFocus={() => setEntryFocus(true)}
                  onBlur={() => {
                    setEntryFocus(false);
                    setEntryPrice(Math.round(entryPrice * 100) / 100);
                  }}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="pl-8 font-mono font-bold focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            {/* Stop Loss Price */}
            <div className="space-y-2">
              <Label htmlFor="stopLoss" className="text-xs font-semibold text-muted-foreground">
                Stop Loss Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">{currencySymbol}</span>
                <Input
                  id="stopLoss"
                  type={slFocus ? "number" : "text"}
                  value={slFocus ? stopLossPrice || "" : formatCurrency(stopLossPrice)}
                  onFocus={() => setSlFocus(true)}
                  onBlur={() => {
                    setSlFocus(false);
                    setStopLossPrice(Math.round(stopLossPrice * 100) / 100);
                  }}
                  onChange={(e) => setStopLossPrice(Number(e.target.value))}
                  className="pl-8 font-mono font-bold focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            {/* Target Profit Price */}
            <div className="space-y-2">
              <Label htmlFor="targetProfit" className="text-xs font-semibold text-muted-foreground">
                Target Profit
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground font-mono">{currencySymbol}</span>
                <Input
                  id="targetProfit"
                  type={tpFocus ? "number" : "text"}
                  value={tpFocus ? targetProfitPrice || "" : formatCurrency(targetProfitPrice)}
                  onFocus={() => setTpFocus(true)}
                  onBlur={() => {
                    setTpFocus(false);
                    setTargetProfitPrice(Math.round(targetProfitPrice * 100) / 100);
                  }}
                  onChange={(e) => setTargetProfitPrice(Number(e.target.value))}
                  className="pl-8 font-mono font-bold focus-visible:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Stop Loss Presets */}
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase tracking-wider">Stop Loss Presets (Distance)</span>
            <div className="grid grid-cols-4 gap-2">
              {[2, 5, 8, 10].map((pct) => (
                <Button
                  key={pct}
                  variant="outline"
                  size="sm"
                  onClick={() => applySlPreset(pct)}
                  className="h-7 text-[10px] font-bold border border-border/60 font-mono text-muted-foreground hover:text-foreground transition-all rounded-lg"
                >
                  -{pct}%
                </Button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50 my-1"></div>

          {/* Outputs */}
          <div className="space-y-4">
            <h3 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Calculation Results</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Position Size (Nominal) */}
              <div className="bg-card border border-border/40 p-3 rounded-lg">
                <span className="block text-[10px] text-muted-foreground font-semibold">Position Size (Nominal)</span>
                <span className="text-base font-extrabold text-indigo-400 font-mono block mt-0.5">
                  {currencySymbol} {formatCurrency(totalCost)}
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">≈ {shares.toLocaleString()} Shares</span>
              </div>

              {/* Ideal Lots */}
              <div className="bg-card border border-border/40 p-3 rounded-lg">
                <span className="block text-[10px] text-muted-foreground font-semibold">Ideal Lots</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono block mt-0.5">
                  {lots.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] text-muted-foreground">Lots</span>
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">1 Lot = {isIndonesian ? "100" : "100"} shares</span>
              </div>

              {/* Max Profit */}
              <div className="bg-card border border-border/40 p-3 rounded-lg">
                <span className="block text-[10px] text-emerald-400 font-semibold">Keuntungan Maksimal (Max Profit)</span>
                <span className="text-base font-extrabold text-green-500 font-mono block mt-0.5">
                  {currencySymbol} {formatCurrency(maxProfit)}
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                  +{profitPercentageOfCapital.toFixed(2)}% of Capital
                </span>
              </div>

              {/* Max Loss */}
              <div className="bg-card border border-border/40 p-3 rounded-lg">
                <span className="block text-[10px] text-rose-400 font-semibold">Kerugian Maksimal (Max Loss)</span>
                <span className="text-base font-extrabold text-red-500 font-mono block mt-0.5">
                  {currencySymbol} {formatCurrency(maxLoss)}
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                  -{lossPercentageOfCapital.toFixed(2)}% of Capital
                </span>
              </div>

              {/* Risk-to-Reward Ratio */}
              <div className="bg-card border border-border/40 p-3 rounded-lg">
                <span className="block text-[10px] text-muted-foreground font-semibold">Risk-to-Reward Ratio</span>
                <span className="text-base font-extrabold text-indigo-400 font-mono block mt-0.5">
                  1 : {rewardRiskRatio.toFixed(2)}
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                  Target Price: {currencySymbol} {formatCurrency(targetProfitPrice)}
                </span>
              </div>

              {/* Stop Loss Distance */}
              <div className="bg-card border border-border/40 p-3 rounded-lg">
                <span className="block text-[10px] text-muted-foreground font-semibold">Stop Loss Distance / Load</span>
                <span className={`text-base font-extrabold font-mono block mt-0.5 ${stopLossPercent > 0 ? "text-rose-400" : "text-muted-foreground"}`}>
                  {stopLossPercent > 0 ? `${stopLossPercent.toFixed(2)}%` : "0.00%"}
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono mt-0.5">
                  Account Load: {accountLoadPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Error alerts / sanity checks */}
            {stopLossPrice >= entryPrice && entryPrice > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-2.5 text-[10px] font-semibold text-center flex items-center justify-center gap-2">
                <ShieldAlertIcon className="h-3.5 w-3.5" />
                Stop Loss must be lower than Entry Price
              </div>
            )}
            {accountLoadPercent > 100 && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-lg p-2.5 text-[10px] font-semibold text-center flex items-center justify-center gap-2">
                <ShieldAlertIcon className="h-3.5 w-3.5" />
                Warning: Total exposure exceeds account balance! (Over-leveraged)
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/20 p-4 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground mt-auto">
          <span>Always trade according to your risk management plan.</span>
          <span className="flex items-center gap-1 text-indigo-400 font-semibold font-mono">
            R:R Ratio <ArrowUpRightIcon className="h-3 w-3" />
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
