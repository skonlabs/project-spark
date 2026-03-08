import { motion } from "framer-motion";

interface ScoreBarProps {
  label: string;
  score: number;
  description?: string;
}

export function ScoreBar({ label, score, description }: ScoreBarProps) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-blue-500" : score >= 35 ? "bg-yellow-500" : score >= 20 ? "bg-orange-500" : "bg-red-500";
  const textColor = score >= 70 ? "text-emerald-400" : score >= 50 ? "text-blue-400" : score >= 35 ? "text-yellow-400" : score >= 20 ? "text-orange-400" : "text-red-400";
  const glowColor = score >= 70 ? "rgb(16 185 129 / 0.3)" : score >= 50 ? "rgb(59 130 246 / 0.3)" : score >= 35 ? "rgb(234 179 8 / 0.3)" : score >= 20 ? "rgb(249 115 22 / 0.3)" : "rgb(239 68 68 / 0.3)";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-sm font-semibold">{label}</span>
          {description && (
            <span className="ml-2 text-xs text-muted-foreground hidden group-hover:inline transition-opacity">— {description}</span>
          )}
        </div>
        <span className={`text-sm font-bold tabular-nums ${textColor}`}>{score}</span>
      </div>
      <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          style={{ boxShadow: `0 0 8px ${glowColor}` }}
        />
      </div>
    </div>
  );
}
