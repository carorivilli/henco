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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSignOut, useSession } from "@/hooks/auth-hooks";
import { ProfileDialog } from "@/components/user/profile-dialog";

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
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);

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
      className="bg-transparent border-0"
      {...props}
    >
      <SidebarHeader
        className="border-b border-gray-200/30 bg-white/60 backdrop-blur-md rounded-t-lg"
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-gray-100/50"
            >
              <a href="/dashboard" className="flex items-center gap-3">

                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-xl text-gray-900">Henco</span>
                  <span className="text-gray-600">v0.0.1-alpha</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-white/60 backdrop-blur-md">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="text-black hover:text-black hover:bg-gray-100/50"
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
                          className="text-black hover:text-black data-[active=true]:bg-gray-200/70 data-[active=true]:text-black hover:bg-gray-100/50"
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
        className="border-t border-gray-200/30 bg-white/60 backdrop-blur-md rounded-b-lg"
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setProfileDialogOpen(true)}
              className="text-gray-900 hover:text-gray-900 hover:bg-gray-100/50 cursor-pointer h-auto py-2"
            >
              <Avatar className="size-8 border-2 border-primary/20">
                <AvatarImage
                  src={session?.user?.image || undefined}
                  alt={session?.user?.name || "Usuario"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {session?.user?.name
                    ? session.user.name.charAt(0).toUpperCase()
                    : session?.user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">
                  {session?.user?.name || session?.user?.email || "Usuario"}
                </span>
                <span className="text-xs text-gray-600">
                  {session?.user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              disabled={isPending}
              className="text-gray-900 hover:text-gray-900 hover:bg-gray-100/50 cursor-pointer"
            >
              <LogOut className="size-4" />
              {isPending ? "Cerrando..." : "Cerrar Sesión"}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Profile Dialog */}
      {session?.user?.id && (
        <ProfileDialog
          open={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
          userId={session.user.id}
          userName={session.user.name}
          userEmail={session.user.email}
        />
      )}
    </Sidebar>
  );
}
