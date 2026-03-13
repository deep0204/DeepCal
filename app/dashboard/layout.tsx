import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Changed min-h-screen to h-screen to lock it to the viewport
    // 2. Removed overflow-x-hidden which was breaking the sticky sidebar!
    <div className="flex h-screen w-full bg-muted/30 overflow-hidden">
      <Sidebar />
      {/* 3. Added overflow-y-auto HERE so ONLY the right side scrolls */}
      <main className="flex-1 min-w-0 w-full h-full overflow-y-auto">
        <div className="p-4 lg:p-8 w-full max-w-full">{children}</div>
      </main>
    </div>
  )
}