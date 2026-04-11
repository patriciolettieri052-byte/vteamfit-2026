import BottomNav from '@/components/ui/BottomNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen selection:bg-copper selection:text-white">
      <main className="flex-1 pb-[100px]">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
