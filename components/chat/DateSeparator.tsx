'use client';

export default function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full backdrop-blur-sm">
        {date}
      </span>
    </div>
  );
}
