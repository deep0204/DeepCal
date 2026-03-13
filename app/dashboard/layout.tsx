import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // STRICT WIDTH BOUNDARIES ADDED HERE
    <div className="flex min-h-screen w-full overflow-x-hidden bg-muted/30">
      <Sidebar />
      {/* min-w-0 is the magic key that forces child cards to shrink on mobile */}
      <main className="flex-1 min-w-0 w-full">
        <div className="p-4 lg:p-8 w-full max-w-full">{children}</div>
      </main>
    </div>
  )
}