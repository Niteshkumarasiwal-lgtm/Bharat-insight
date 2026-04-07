function SkeletonBlock({ className }: { className: string }) {
  return <div className={`skeleton ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--foreground)] md:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <SkeletonBlock className="mb-4 h-6 w-48 rounded-full" />
          <div className="grid gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock
                key={index}
                className="h-24 rounded-[24px]"
              />
            ))}
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex gap-3">
              <SkeletonBlock className="h-11 flex-1 rounded-2xl" />
              <SkeletonBlock className="h-11 w-36 rounded-2xl" />
              <SkeletonBlock className="h-11 w-36 rounded-2xl" />
            </div>
            <SkeletonBlock className="h-[580px] rounded-[24px]" />
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <SkeletonBlock className="mb-3 h-6 w-36 rounded-full" />
            <SkeletonBlock className="mb-4 h-24 rounded-[24px]" />
            <SkeletonBlock className="mb-3 h-12 rounded-2xl" />
            <SkeletonBlock className="mb-3 h-12 rounded-2xl" />
            <SkeletonBlock className="h-64 rounded-[24px]" />
          </div>
        </div>
      </div>
    </main>
  );
}
