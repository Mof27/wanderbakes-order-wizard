import React from "react";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Home, CakeIcon, Users, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
interface MainLayoutProps {
  children: React.ReactNode;
}
const SidebarMenu = () => {
  const location = useLocation();
  const menuItems = [{
    name: "Dashboard",
    path: "/",
    icon: Home
  }, {
    name: "Orders",
    path: "/orders",
    icon: CakeIcon
  }, {
    name: "Customers",
    path: "/customers",
    icon: Users
  }, {
    name: "Settings",
    path: "/settings",
    icon: Settings
  }];
  return <div className="space-y-2 px-4 py-2">
      {menuItems.map(item => <Link key={item.name} to={item.path} className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-cake-primary", location.pathname === item.path ? "bg-cake-primary" : "text-muted-foreground")}>
          <item.icon className="h-5 w-5" />
          <span>{item.name}</span>
        </Link>)}
    </div>;
};
const MainLayout: React.FC<MainLayoutProps> = ({
  children
}) => {
  return <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <Sidebar className="border-r bg-sidebar">
          <div className="py-6 px-4">
            <div className="flex items-center gap-2 px-2">
              <CakeIcon className="h-6 w-6 text-cake-primary" />
              <h1 className="text-xl font-bold tracking-tight">WanderBakes</h1>
            </div>
          </div>
          <SidebarContent className="bg-rose-200">
            <SidebarMenu />
          </SidebarContent>
          <div className="mt-auto p-4">
            <div className="text-sm text-muted-foreground">
              WanderBakes CRM & Order Management
            </div>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-lg font-medium sm:block hidden">WanderBakes</h1>
            </div>
          </div>
          <div className="p-4">{children}</div>
        </main>
        <Toaster />
      </div>
    </SidebarProvider>;
};
export default MainLayout;