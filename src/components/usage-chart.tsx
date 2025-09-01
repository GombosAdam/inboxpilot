"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format } from "date-fns";

interface UsageChartProps {
  data: Array<{
    date: string;
    prompts: number;
    emailsScanned: number;
    emailsLabeled: number;
  }>;
  type?: "line" | "bar" | "area";
  height?: number;
}

export function UsageChart({ data, type = "line", height = 300 }: UsageChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: format(new Date(item.date), "MMM d")
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="emailsScanned" fill="#10b981" name="Emails Scanned" />
          <Bar dataKey="emailsLabeled" fill="#8b5cf6" name="Emails Labeled" />
          <Bar dataKey="prompts" fill="#3b82f6" name="AI Prompts" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="emailsScanned" 
            stackId="1"
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.6}
            name="Emails Scanned"
          />
          <Area 
            type="monotone" 
            dataKey="emailsLabeled" 
            stackId="1"
            stroke="#8b5cf6" 
            fill="#8b5cf6" 
            fillOpacity={0.6}
            name="Emails Labeled"
          />
          <Area 
            type="monotone" 
            dataKey="prompts" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.6}
            name="AI Prompts"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="emailsScanned" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Emails Scanned"
        />
        <Line 
          type="monotone" 
          dataKey="emailsLabeled" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Emails Labeled"
        />
        <Line 
          type="monotone" 
          dataKey="prompts" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={{ r: 4 }}
          name="AI Prompts"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface UsageDistributionProps {
  prompts: number;
  emailsScanned: number;
  emailsLabeled: number;
}

export function UsageDistribution({ prompts, emailsScanned, emailsLabeled }: UsageDistributionProps) {
  const data = [
    { name: "AI Prompts", value: prompts, color: "#3b82f6" },
    { name: "Emails Scanned", value: emailsScanned, color: "#10b981" },
    { name: "Emails Labeled", value: emailsLabeled, color: "#8b5cf6" }
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}