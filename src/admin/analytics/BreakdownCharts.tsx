/**
 * Analytics Breakdown Visualizations
 * 
 * Provides charts for specific categories including top planets visited, 
 * mission funnel completion rates, and game mode distribution.
 */
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import { COLORS } from "./types";

interface BreakdownChartsProps {
  topPlanets: { name: string; count: number }[];
  missionFunnel: { name: string; count: number }[];
  modeData: { name: string; value: number }[];
}

type TooltipEntry = {
  color?: string;
  name?: string | number;
  value?: string | number;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[hsl(230_30%_15%)] p-3 shadow-xl">
        <p className="mb-1 text-sm font-medium text-[hsl(223_25%_91%)]">{String(label ?? "")}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {String(entry.name)}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const BreakdownCharts = ({ topPlanets, missionFunnel, modeData }: BreakdownChartsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="ds-panel p-6">
          <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)] mb-4">
            Top 5 Planets
          </h2>
          {topPlanets.length === 0 ? (
            <p className="text-sm text-[hsl(225_16%_68%)]">No planet data yet.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPlanets} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="hsl(225, 16%, 68%)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(225, 16%, 68%)" fontSize={12} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Visits" fill="hsl(280, 84%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="ds-panel p-6">
          <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)] mb-4">
            Mission Funnel
          </h2>
          {missionFunnel.length === 0 ? (
            <p className="text-sm text-[hsl(225_16%_68%)]">No mission data yet.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missionFunnel} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(225, 16%, 68%)" fontSize={12} />
                  <YAxis stroke="hsl(225, 16%, 68%)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Events" radius={[4, 4, 0, 0]}>
                    {missionFunnel.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="ds-panel p-6">
          <h2 className="text-xl font-semibold leading-8 text-[hsl(223_25%_91%)] mb-4">
            Game Modes
          </h2>
          {modeData.length === 0 ? (
            <p className="text-sm text-[hsl(225_16%_68%)]">No mode-change data yet.</p>
          ) : (
            <div className="h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {modeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                <span className="text-2xl font-bold text-white">
                  {modeData.reduce((a, b) => a + b.value, 0)}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};
