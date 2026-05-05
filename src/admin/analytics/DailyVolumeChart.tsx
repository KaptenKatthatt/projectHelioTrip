/**
 * Daily Event Volume Chart
 * 
 * Renders an AreaChart showing the trend of total events captured per day 
 * over the last 30 days.
 */
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { DaySummary } from "./types";

interface DailyVolumeChartProps {
  data: DaySummary[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[hsl(230_30%_15%)] p-3 shadow-xl">
        <p className="mb-1 text-sm font-medium text-[hsl(223_25%_91%)]">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DailyVolumeChart = ({ data }: DailyVolumeChartProps) => {
  return (
    <section className="ds-panel p-6">
      <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)] mb-6">
        Daily Volume
      </h2>
      {data.length === 0 ? (
        <p className="text-sm text-[hsl(225_16%_68%)]">No daily data yet.</p>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(238, 84%, 60%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(238, 84%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => val.slice(5)} 
                stroke="hsl(225, 16%, 68%)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="hsl(225, 16%, 68%)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Events" stroke="hsl(238, 84%, 60%)" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};
