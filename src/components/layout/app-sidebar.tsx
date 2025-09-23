import * as React from "react";
import Link from "next/link";
import { Vegan } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type SidebarData = {
  navMain: {
    title: string;
    url: string;
    items: {
      title: string;
      url: string;
      isActive?: boolean;
    }[];
  }[];
};

const data: SidebarData = {
  navMain: [
    {
      title: "Principal",
      url: "/dashboard",
      items: [
        {
          title: "Productos",
          url: "/dashboard/productos",
        },
        {
          title: "Mix",
          url: "/dashboard/mix",
        },
      ],
    },
    {
      title: "Configuración",
      url: "#",
      items: [
        {
          title: "Tipos de Productos",
          url: "/dashboard/tipos-productos",
        },
        {
          title: "Tipos de Precio",
          url: "/dashboard/tipos-precio",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="floating"
      className="backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(220, 243, 212, 0.95)', borderColor: 'rgba(220, 243, 212, 1)' }}
      {...props}
    >
      <SidebarHeader
        className="border-b"
        style={{ backgroundColor: 'rgba(220, 243, 212, 0.95)', borderColor: 'rgba(210, 233, 202, 1)' }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-[#f5e3ce]"
            >
              <a href="#">
                <div className="bg-green-100 text-green-700 flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Vegan className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium text-black">Henco</span>
                  <span className="text-gray-800">v0.0.1-alpha</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent style={{ backgroundColor: 'rgba(220, 243, 212, 0.95)' }}>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="text-black hover:text-green-800 hover:bg-[#d2e3ca]"
                >
                  <Link href={item.url} className="font-medium">
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={item.isActive}
                          className="text-black hover:text-green-700 data-[active=true]:bg-green-500 data-[active=true]:text-white hover:bg-[#d2e3ca]/60"
                        >
                          <Link href={item.url}>{item.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
