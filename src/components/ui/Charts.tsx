interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}

export function DonutChart({ data, size = 160, thickness = 28 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-300">0</p>
          <p className="text-xs text-gray-400">No data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={thickness} />
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; secondary?: number }[];
  height?: number;
  color?: string;
  secondaryColor?: string;
}

export function BarChart({
  data,
  height = 180,
  color = '#3b82f6',
  secondaryColor = '#a78bfa',
}: BarChartProps) {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.secondary ?? 0)), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
          <div className="flex items-end gap-1 w-full justify-center h-full">
            {d.secondary !== undefined && (
              <div
                className="w-3 rounded-t-md transition-all duration-700 hover:opacity-80"
                style={{
                  height: `${(d.secondary / max) * 100}%`,
                  backgroundColor: secondaryColor,
                  minHeight: d.secondary > 0 ? '4px' : '0',
                }}
                title={`${d.secondary} completed`}
              />
            )}
            <div
              className="w-4 rounded-t-md transition-all duration-700 hover:opacity-80"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: color,
                minHeight: d.value > 0 ? '4px' : '0',
              }}
              title={`${d.value} total`}
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

interface ProgressBarProps {
  data: { label: string; value: number; color: string }[];
}

export function ProgressBar({ data }: ProgressBarProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
        {data.map((d, i) => (
          <div
            key={i}
            className="transition-all duration-700"
            style={{ width: `${(d.value / total) * 100}%`, backgroundColor: d.color }}
            title={`${d.label}: ${d.value}`}
          />
        ))}
      </div>
    </div>
  );
}
