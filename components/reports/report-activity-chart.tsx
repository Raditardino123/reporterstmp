"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { ReportDayRow } from "@/lib/reports";

type ReportActivityChartProps = {
  data: ReportDayRow[];
};

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function ReportActivityChart({ data }: ReportActivityChartProps) {
  return (
    <div className="mt-4 h-56">
      {data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.map((row) => ({ ...row, shortDate: formatDate(row.date) }))}
            margin={{ top: 10, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="reportActivityGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8CC70" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="shortDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A7A9B2", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                background: "#0A0F1F",
                border: "1px solid rgba(212,175,55,0.28)",
                borderRadius: 10,
                color: "#F5F1E8",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Emails"
              stroke="#D4AF37"
              strokeWidth={2}
              fill="url(#reportActivityGold)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-[#A7A9B2]">
          Tidak ada aktivitas untuk periode ini.
        </div>
      )}
    </div>
  );
}
