import { AppSidebar } from "@/components/layout/app-sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";

export default function PlatformLayout({ children }: PropsWithChildren<{}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
