"use client";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { money } from "@/lib/utils";

export function RevenueArea({ data }: { data: { day: string; sell: number; profit: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" />
          <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickMargin={8} />
          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => Intl.NumberFormat().format(v)} />
          <Tooltip
            contentStyle={{ background: "#13151c", border: "1px solid #252836", borderRadius: 8 }}
            formatter={(v: number) => money(Number(v))}
          />
          <Area dataKey="sell" name="Revenue" stroke="#3b82f6" fill="url(#g1)" strokeWidth={2} />
          <Area dataKey="profit" name="Profit" stroke="#8b5cf6" fill="url(#g2)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyPLChart({ data }: { data: { month: string; profit: number; loss: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2230" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip
            contentStyle={{ background: "#13151c", border: "1px solid #252836", borderRadius: 8 }}
            formatter={(v: number) => money(Number(v))}
          />
          <Line dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
