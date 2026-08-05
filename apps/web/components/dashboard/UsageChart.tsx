'use client';

import { useState, useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { motion } from 'framer-motion';
import type { TimeRange, UsageData } from '@/types';

Chart.register(...registerables);

interface UsageChartProps {
  data?: UsageData;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}


export function UsageChart({ data, timeRange, onTimeRangeChange }: UsageChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    const chartData = data || generateSampleData(timeRange);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Credits Used',
            data: chartData.used,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3b82f6',
          },
          {
            label: 'Credits Added',
            data: chartData.added,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#22c55e',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                const value = typeof context.parsed.y === 'number' ? context.parsed.y : null;
                return `${context.dataset.label}: ${value !== null ? value.toFixed(2) : 'N/A'} credits`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              callback: function (value) {
                if (typeof value === 'number') {
                  return value.toFixed(1);
                }
                return String(value);
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, timeRange]);

  const timeOptions = [
    { value: 'week', label: '7 Days' },
    { value: 'month', label: '30 Days' },
    { value: 'quarter', label: '90 Days' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📊 Usage Overview</h2>
        <div className="flex gap-2">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeRangeChange(option.value as 'week' | 'month' | 'quarter')}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                timeRange === option.value
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64">
        <canvas ref={chartRef} />
      </div>
    </motion.div>
  );
}

function generateSampleData(timeRange: string): UsageData {
  const labels: string[] = [];
  const used: number[] = [];
  const added: number[] = [];
  const now = new Date();

  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    const baseUsage = 5 + Math.random() * 15;
    used.push(baseUsage + (i % 3 === 0 ? 5 : 0));
    added.push(10 + Math.random() * 20 + (i % 5 === 0 ? 30 : 0));
  }

  return { labels, used, added };
}
