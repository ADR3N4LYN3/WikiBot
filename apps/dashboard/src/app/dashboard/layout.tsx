import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SidebarProvider } from '@/components/SidebarContext';
import { DashboardShell } from '@/components/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <DashboardShell>
        <div className="min-h-screen flex">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-64">
            <Header user={session.user} />
            <main className="flex-1 p-4 lg:p-6 bg-muted/30">{children}</main>
          </div>
        </div>
      </DashboardShell>
    </SidebarProvider>
  );
}
