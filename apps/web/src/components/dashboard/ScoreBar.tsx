"use client";

interface ScoreBarProps {
  label: string;
  score: number;
  description?: string;
}

export function ScoreBar({ label, score, description }: ScoreBarProps) {
  const color =
    score >= 70
      ? "bg-green-500"
      : score >= 50
      ? "bg-blue-500"
      : score >= 35
      ? "bg-yellow-500"
      : score >= 20
      ? "bg-orange-500"
      : "bg-red-500";

  const textColor =
    score >= 70
      ? "text-green-400"
      : score >= 50
      ? "text-blue-400"
      : score >= 35
      ? "text-yellow-400"
      : score >= 20
      ? "text-orange-400"
      : "text-red-400";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <span className="ml-2 text-xs text-muted-foreground hidden group-hover:inline">
              — {description}
            </span>
          )}
        </div>
        <span className={`text-sm font-bold tabular-nums ${textColor}`}>
          {score}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
