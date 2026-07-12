import { AppSidebar } from "@/src/components/common/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar";

export default function LayoutMain({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto p-3">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
