/**
 * Skeleton placeholder — мерцающий блок пока данные грузятся.
 * Использует Tailwind animate-pulse.
 *
 * Использование:
 *   <Skeleton className="h-4 w-32" />
 *   <SkeletonRow />                       // одна строка объекта
 *   <SkeletonPosition />                  // одна строка позиции
 */

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-concrete-dim/60 animate-pulse ${className}`}
    />
  )
}

export function SkeletonCaseRow() {
  return (
    <div className="flex items-stretch border-b border-concrete-dim last:border-b-0">
      <div className="w-[3px] shrink-0 bg-concrete-dim animate-pulse" />
      <div className="flex-1 px-4 py-3">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-3" />
        </div>
        <Skeleton className="h-[2px] w-full mt-2 mb-2" />
        <div className="flex items-center gap-3 mt-1">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-8" />
          <Skeleton className="h-2.5 w-12" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonPositionRow() {
  return (
    <div className="border-b border-concrete-dim last:border-b-0 py-3 px-4 flex items-center gap-3">
      <div className="flex-1">
        <Skeleton className="h-3.5 w-3/4 mb-2" />
        <Skeleton className="h-2.5 w-1/3" />
      </div>
      <Skeleton className="h-9 w-20" />
    </div>
  )
}

export function SkeletonHistoryDate() {
  return (
    <div className="mb-6">
      <Skeleton className="h-4 w-32 mb-3" />
      <div className="bg-card border border-concrete-dim">
        {[0, 1].map((i) => (
          <div key={i} className="border-b border-concrete-dim last:border-b-0 px-4 py-3">
            <Skeleton className="h-3.5 w-3/4 mb-2" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
