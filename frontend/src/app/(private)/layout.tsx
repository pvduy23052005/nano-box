import AppHeader from "@/src/components/common/AppHeader";
import AppSidebar from "@/src/components/common/AppSidebar";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import AuthProvider from "@/src/features/auth/context/authProvider";

export default function LayoutMain({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-col flex-1  overflow-hidden">
          <AppHeader />
          <div className="flex-1 min-h-0 relative">{children}</div>
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
