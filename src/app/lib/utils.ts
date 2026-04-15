// src/lib/utils.ts
// Shared utility functions

import { clsx, type ClassValue } from 'clsx';
import { JobStatus } from '@/app/types';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a date string to a readable format */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format relative time (e.g., "2 hours ago") */
export function timeAgo(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/** Get badge class for job status */
export function statusBadgeClass(status: JobStatus): string {
  const map: Record<JobStatus, string> = {
    open: 'badge-open',
    screening: 'badge-screening',
    closed: 'badge-closed',
  };
  return `badge ${map[status] || 'badge-closed'}`;
}

/** Get status label */
export function statusLabel(status: JobStatus): string {
  const map: Record<JobStatus, string> = {
    open: 'Open',
    screening: 'Screening',
    closed: 'Closed',
  };
  return map[status] || status;
}

/** Get score color class */
export function scoreColor(score: number): string {
  if (score >= 80) return '#10B981'; // green
  if (score >= 65) return '#2C7CF2'; // blue
  if (score >= 50) return '#F59E0B'; // amber
  return '#EF4444'; // red
}

/** Get recommendation badge style */
export function recommendationStyle(rec: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    'Strong Yes': { bg: '#ECFDF5', color: '#059669' },
    'Yes': { bg: '#EBF2FF', color: '#2C7CF2' },
    'Maybe': { bg: '#FFFBEB', color: '#D97706' },
    'No': { bg: '#FEF2F2', color: '#DC2626' },
    'Manual review': { bg: '#F3F4F6', color: '#6B7280' },
  };
  return map[rec] || { bg: '#F3F4F6', color: '#6B7280' };
}

/** Parse comma/newline separated skills string into array */
export function parseSkillsInput(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map(s => s.trim())
    .filter(Boolean);
}

/** Check if backend is reachable */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`,
      { signal: AbortSignal.timeout(3000) }
    );
    return res.ok;
  } catch {
    return false;
  }
}