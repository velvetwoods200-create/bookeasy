import DashboardNav from '@/components/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardNav />
      {/* pt-14 on mobile accounts for fixed top header; pb-16 accounts for fixed bottom nav */}
      <main className="flex-1 overflow-auto pt-14 pb-16 md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}
