import { motion } from "framer-motion";

interface ScoreBarProps {
  label: string;
  score: number;
  description?: string;
}

export function ScoreBar({ label, score, description }: ScoreBarProps) {
  const color = score >= 65 ? "bg-emerald-500" : score >= 45 ? "bg-yellow-500" : "bg-red-500";
  const textColor = score >= 65 ? "text-emerald-400" : score >= 45 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <span className="ml-2 text-xs text-muted-foreground hidden group-hover:inline">— {description}</span>
          )}
        </div>
        <span className={`text-sm font-mono font-semibold tabular-nums ${textColor}`}>{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        />
      </div>
    </div>
  );
}
