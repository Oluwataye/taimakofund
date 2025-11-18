import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { ModeratorSidebar } from '@/components/moderator/ModeratorSidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export function ModeratorLayout() {
  return (
    <ProtectedRoute requireModerator>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <ModeratorSidebar />
          
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-background flex items-center px-6">
              <SidebarTrigger />
              <h2 className="ml-4 text-xl font-semibold">TaimakoFund Moderator</h2>
            </header>
            
            <main className="flex-1 p-6 bg-muted/30">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
