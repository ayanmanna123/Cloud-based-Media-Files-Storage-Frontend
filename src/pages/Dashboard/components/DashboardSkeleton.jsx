import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function DashboardSkeleton({ viewMode = 'grid' }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Folders Skeleton Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <Skeleton width={120} height={20} className="rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="p-4 border border-border/60 rounded-xl bg-card flex flex-col gap-3 shadow-xs"
            >
              <div className="flex justify-between items-start">
                <Skeleton circle width={32} height={32} />
                <Skeleton width={20} height={20} className="rounded-sm" />
              </div>
              <Skeleton width="65%" height={18} className="rounded-md mt-1" />
              <div className="flex justify-between items-center mt-1">
                <Skeleton width="35%" height={14} className="rounded-md" />
                <Skeleton width="25%" height={14} className="rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Files Skeleton Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <Skeleton width={100} height={20} className="rounded-md" />
        </div>

        {viewMode === 'list' ? (
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-xs">
            {/* List Table Header */}
            <div className="flex items-center gap-4 p-4 border-b border-border/60 bg-muted/40 text-sm font-medium">
              <div className="flex-1 min-w-0">
                <Skeleton width={120} height={16} className="rounded-md" />
              </div>
              <div className="hidden sm:block w-32 shrink-0">
                <Skeleton width={60} height={16} className="rounded-md" />
              </div>
              <div className="hidden md:block w-32 shrink-0">
                <Skeleton width={80} height={16} className="rounded-md" />
              </div>
              <div className="hidden sm:block w-20 shrink-0">
                <Skeleton width={40} height={16} className="rounded-md" />
              </div>
              <div className="w-8 shrink-0"></div>
            </div>

            {/* List Table Rows */}
            <div className="divide-y divide-border/60">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Skeleton circle width={24} height={24} className="shrink-0" />
                    <Skeleton width="50%" height={18} className="rounded-md" />
                  </div>
                  <div className="hidden sm:block w-32 shrink-0">
                    <Skeleton width="70%" height={14} className="rounded-md" />
                  </div>
                  <div className="hidden md:block w-32 shrink-0">
                    <Skeleton width="80%" height={14} className="rounded-md" />
                  </div>
                  <div className="hidden sm:block w-20 shrink-0">
                    <Skeleton width="50%" height={14} className="rounded-md" />
                  </div>
                  <div className="w-8 shrink-0 flex justify-end">
                    <Skeleton circle width={16} height={16} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className="p-3 border border-border/60 rounded-xl bg-card flex flex-col gap-2.5 shadow-xs"
              >
                <Skeleton height={110} className="rounded-lg" />
                <Skeleton width="85%" height={16} className="rounded-md mt-0.5" />
                <div className="flex justify-between items-center mt-1">
                  <Skeleton width="40%" height={12} className="rounded-md" />
                  <Skeleton width="35%" height={12} className="rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
