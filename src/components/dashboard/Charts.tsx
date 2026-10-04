'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface ChartsProps {
  verdictData: { name: string; value: number; color: string }[];
  dimensionAverages: { dimension: string; score: number; fullMark: number }[];
  scoreBuckets: { range: string; count: number }[];
  trends: any[];
}

export default function Charts({
  verdictData,
  dimensionAverages,
  scoreBuckets,
  trends,
}: ChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
        <div className="h-72 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Verdict Distribution Chart */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Verdict Distribution</h3>
          <span className="text-xs text-slate-400">Pass vs Needs Improvement vs Fail</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={verdictData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {verdictData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Dimension Averages Radar Chart */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Four-Pillar Dimension Profile</h3>
          <span className="text-xs text-slate-400">Scale 0 - 100</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dimensionAverages}>
              <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748b', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" strokeOpacity={0.2} />
              <Radar
                name="Average Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Score Distribution Buckets */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Overall Score Distribution</h3>
          <span className="text-xs text-slate-400">Frequency per score bracket</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Evaluations Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Trends Over Time */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Quality Trends Over Time</h3>
          <span className="text-xs text-slate-400">Chronological score progression</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.15} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="avg_score"
                name="Avg Score"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="avg_accuracy"
                name="Avg Accuracy"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
