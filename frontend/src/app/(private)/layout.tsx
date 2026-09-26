import AppHeader from "@/src/components/common/AppHeader";
import AppSidebar from "@/src/components/common/AppSidebar";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import AuthProvider from "@/src/features/auth/context/authProvider";
import { SocketProvider } from "@/src/providers/SocketProvider";
import ChatSocketListener from "@/src/features/chat/socket/ChatSocketListener";

export default function LayoutMain({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatSocketListener />
        <SidebarProvider defaultOpen={false}>
          <AppSidebar />
          <main className="flex flex-col flex-1 overflow-hidden h-screen">
            <AppHeader />
            <div className="flex-1 min-h-0 relative">{children}</div>
          </main>
        </SidebarProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
