"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSignOut, useSession } from "@/hooks/auth-hooks";

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
  const router = useRouter();
  const { data: session } = useSession();
  const { signOut, isPending } = useSignOut();

  const handleSignOut = () => {
    signOut(undefined, {
      onSuccess: () => {
        toast.success("Sesión cerrada exitosamente");
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message || "Error al cerrar sesión");
      },
    });
  };

  return (
    <Sidebar
      variant="floating"
      className="backdrop-blur-sm"
      {...props}
    >
      <SidebarHeader
        className="border-b border-white/20"
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-white/10"
            >
              <a href="/dashboard" className="flex items-center gap-3">
                <img
                  src="/logoHenco.jpeg"
                  alt="Logo Henco"
                  className="w-30 h-30 rounded-lg object-cover"
                />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium text-white">Henco</span>
                  <span className="text-white/80">v0.0.1-alpha</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="text-white hover:text-white hover:bg-white/10"
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
                          className="text-white/90 hover:text-white data-[active=true]:bg-white/20 data-[active=true]:text-white hover:bg-white/10"
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
      <SidebarFooter
        className="border-t border-white/20"
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-white hover:text-white hover:bg-white/10"
            >
              <div className="flex items-center gap-2 px-2 py-1.5">
                <User className="size-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {session?.user?.name || session?.user?.email || "Usuario"}
                  </span>
                  <span className="text-xs text-white/70">
                    {session?.user?.email}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              disabled={isPending}
              className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <LogOut className="size-4" />
              {isPending ? "Cerrando..." : "Cerrar Sesión"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
