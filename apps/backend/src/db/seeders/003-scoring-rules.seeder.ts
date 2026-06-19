import { db } from "@/db/db";
import { scoringRules } from "@/db/schema";

export default async function seed() {
  console.log("🌱 Seeding data for: scoring_rules...");

  const rules = [
    // === DAY STRATEGY ===
    { strategy: "day", parameterName: "rvol_high_threshold", value: 2.0, weight: 35 },
    { strategy: "day", parameterName: "rvol_medium_threshold", value: 1.5, weight: 25 },
    { strategy: "day", parameterName: "rvol_low_threshold", value: 1.0, weight: 15 },
    
    { strategy: "day", parameterName: "atr_high_threshold", value: 5.0, weight: 25 },
    { strategy: "day", parameterName: "atr_medium_threshold", value: 3.0, weight: 15 },
    
    { strategy: "day", parameterName: "gap_high_threshold", value: 2.0, weight: 15 },
    { strategy: "day", parameterName: "gap_medium_threshold", value: 1.0, weight: 10 },
    
    { strategy: "day", parameterName: "rsi_overbought", value: 60.0, weight: 15 },
    { strategy: "day", parameterName: "rsi_oversold", value: 30.0, weight: 15 },
    
    { strategy: "day", parameterName: "liquidity_high", value: 1000000.0, weight: 10 },
    { strategy: "day", parameterName: "liquidity_medium", value: 500000.0, weight: 5 },

    { strategy: "day", parameterName: "bb_lower_bounce", value: 0.0, weight: 15 },
    { strategy: "day", parameterName: "price_above_vwap", value: 0.0, weight: 20 },
    { strategy: "day", parameterName: "zscore_extreme_reversal", value: 2.5, weight: 20 },
    { strategy: "day", parameterName: "ad_line_uptrend", value: 0.0, weight: 15 },

    // === SWING STRATEGY ===
    { strategy: "swing", parameterName: "trend_close_above_ema20", value: 0.0, weight: 15 },
    { strategy: "swing", parameterName: "trend_ema20_above_ema50", value: 0.0, weight: 20 },
    
    { strategy: "swing", parameterName: "macd_hist_positive", value: 0.0, weight: 10 },
    { strategy: "swing", parameterName: "macd_line_above_signal", value: 0.0, weight: 15 },
    
    { strategy: "swing", parameterName: "rsi_neutral_low", value: 40.0, weight: 20 },
    { strategy: "swing", parameterName: "rsi_neutral_high", value: 65.0, weight: 20 },
    { strategy: "swing", parameterName: "rsi_neutral_exit", value: 70.0, weight: 10 },
    
    { strategy: "swing", parameterName: "volume_above_average", value: 0.0, weight: 10 },
    
    { strategy: "swing", parameterName: "proximity_ema20_percent", value: 0.02, weight: 10 },

    { strategy: "swing", parameterName: "macd_golden_cross", value: 0.0, weight: 20 },
    { strategy: "swing", parameterName: "adx_strong_trend", value: 25.0, weight: 15 },
    { strategy: "swing", parameterName: "vwap_deviation_exhaustion", value: 2.0, weight: 10 },

    // === POSITION STRATEGY ===
    { strategy: "position", parameterName: "trend_close_above_sma200", value: 0.0, weight: 15 },
    { strategy: "position", parameterName: "trend_sma50_above_sma200", value: 0.0, weight: 25 },
    
    { strategy: "position", parameterName: "strength_52w_high_diff", value: 0.1, weight: 25 },
    
    { strategy: "position", parameterName: "momentum_1y_high", value: 20.0, weight: 20 },
    { strategy: "position", parameterName: "momentum_1y_medium", value: 10.0, weight: 10 },
    
    { strategy: "position", parameterName: "volatility_atr_low", value: 3.0, weight: 15 },
    { strategy: "position", parameterName: "volatility_atr_medium", value: 5.0, weight: 5 },

    { strategy: "position", parameterName: "poc_pullback_proximity", value: 0.05, weight: 20 },
    { strategy: "position", parameterName: "rvol_breakout_confirm", value: 1.5, weight: 15 },

    // === RISK PARAMETERS FOR DAY STRATEGY ===
    { strategy: "risk_day", parameterName: "fallback_atr_percent", value: 0.01, weight: 0 },
    { strategy: "risk_day", parameterName: "sl_multiplier", value: 1.0, weight: 0 },
    { strategy: "risk_day", parameterName: "tp_multiplier", value: 2.0, weight: 0 },
    { strategy: "risk_day", parameterName: "min_reward_risk_ratio", value: 1.5, weight: 0 },

    // === RISK PARAMETERS FOR SWING STRATEGY ===
    { strategy: "risk_swing", parameterName: "fallback_atr_percent", value: 0.02, weight: 0 },
    { strategy: "risk_swing", parameterName: "sl_multiplier", value: 2.0, weight: 0 },
    { strategy: "risk_swing", parameterName: "tp_multiplier", value: 6.0, weight: 0 },
    { strategy: "risk_swing", parameterName: "min_reward_risk_ratio", value: 2.0, weight: 0 },

    // === RISK PARAMETERS FOR POSITION STRATEGY ===
    { strategy: "risk_position", parameterName: "fallback_atr_percent", value: 0.05, weight: 0 },
    { strategy: "risk_position", parameterName: "sl_multiplier", value: 3.0, weight: 0 },
    { strategy: "risk_position", parameterName: "tp_multiplier", value: 15.0, weight: 0 },
    { strategy: "risk_position", parameterName: "min_reward_risk_ratio", value: 5.0, weight: 0 }
  ];

  for (const rule of rules) {
    // We check if the parameter already exists to prevent duplicate entries
    const existing = await db.query.scoringRules.findFirst({
      where: (sr, { and, eq }) => and(eq(sr.strategy, rule.strategy), eq(sr.parameterName, rule.parameterName))
    });

    if (!existing) {
      await db.insert(scoringRules).values(rule);
    }
  }

  console.log("✅ Scoring rules seeded successfully!");
}
