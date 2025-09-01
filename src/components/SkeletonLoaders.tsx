'use client';
import { FC } from 'react';

export const EmailCardSkeleton: FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="grid grid-cols-12 gap-4">
        {/* Priority */}
        <div className="col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        {/* From */}
        <div className="col-span-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Subject */}
        <div className="col-span-3">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="col-span-4">
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>

        {/* Date */}
        <div className="col-span-1">
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmailListSkeleton: FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <EmailCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const StatsCardSkeleton: FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-16 h-8 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="w-full h-2 bg-gray-100 rounded-full">
          <div className="h-2 bg-gray-200 rounded-full w-3/5"></div>
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton: FC = () => {
  return (
    <div className="container mx-auto px-6 py-8 animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-6">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Command Center Skeleton */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
        <div className="space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
            <div>
              <div className="h-20 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export const PlanPageSkeleton: FC = () => {
  return (
    <div className="container mx-auto px-6 py-8 animate-pulse">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl p-6">
                <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
        <div className="flex border-b border-gray-200">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 px-6 py-4 text-center">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export const ChartSkeleton: FC<{ height?: string }> = ({ height = 'h-64' }) => {
  return (
    <div className={`bg-gray-100 rounded-lg ${height} animate-pulse flex items-end justify-center space-x-2 p-4`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded-t w-4"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
  );
};

export const TableSkeleton: FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  {colIndex === 0 && <div className="h-3 bg-gray-200 rounded w-1/2"></div>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};