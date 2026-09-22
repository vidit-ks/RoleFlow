import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-card animate-pulse space-y-3">
    <div className="flex justify-between items-center">
      <div className="h-4 w-24 bg-slate-200 rounded"></div>
      <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
    </div>
    <div className="h-8 w-16 bg-slate-300 rounded"></div>
    <div className="h-3 w-36 bg-slate-200 rounded"></div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
          <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
          <div className="h-4 w-1/6 bg-slate-200 rounded"></div>
          <div className="h-4 w-1/6 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);
