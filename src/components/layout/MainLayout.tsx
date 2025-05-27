import React from "react";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, CakeIcon, Users, Settings, ChefHat, Truck, BeakerIcon, ImagesIcon, ShieldCheck, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import OnlineStatusIndicator from "./OnlineStatusIndicator";
import Clock from "./Clock";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import { AppRole } from "@/services/supabase/database.types";

interface MainLayoutProps {
  children: React.ReactNode;
  extraHeaderContent?: React.ReactNode;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ElementType;
  allowedRoles?: AppRole[];
}

const SidebarMenu = () => {
  const location = useLocation();
  const { hasRole } = useAuth();
  
  const menuItems: MenuItem[] = [
    {
      name: "Dashboard",
      path: "/",
      icon: Home,
      allowedRoles: ['admin', 'sales', 'kitchen', 'baker', 'delivery', 'customer_service']
    }, 
    {
      name: "Orders",
      path: "/orders",
      icon: CakeIcon,
      allowedRoles: ['admin', 'sales', 'customer_service']
    },
    {
      name: "Kitchen",
      path: "/kitchen",
      icon: ChefHat,
      allowedRoles: ['admin', 'kitchen']
    },
    {
      name: "Baker",
      path: "/baker",
      icon: BeakerIcon,
      allowedRoles: ['admin', 'baker']
    },
    {
      name: "Delivery",
      path: "/delivery",
      icon: Truck,
      allowedRoles: ['admin', 'delivery', 'customer_service']
    },
    {
      name: "Gallery",
      path: "/gallery",
      icon: ImagesIcon,
      allowedRoles: ['admin', 'sales', 'kitchen', 'baker', 'customer_service']
    },
    {
      name: "Customers",
      path: "/customers",
      icon: Users,
      allowedRoles: ['admin', 'sales', 'customer_service']
    }
  ];
  
  // Admin-only menu items
  const adminMenuItems: MenuItem[] = [
    {
      name: "User Management",
      path: "/admin/users",
      icon: UserCog,
      allowedRoles: ['admin']
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
      allowedRoles: ['admin']
    }
  ];

  // Filter menu items based on user roles
  const visibleMenuItems = menuItems.filter(
    item => !item.allowedRoles || item.allowedRoles.some(role => hasRole(role))
  );
  
  const visibleAdminItems = adminMenuItems.filter(
    item => !item.allowedRoles || item.allowedRoles.some(role => hasRole(role))
  );

  return (
    <div className="space-y-2 px-4 py-2">
      {visibleMenuItems.map(item => (
        <Link 
          key={item.name} 
          to={item.path} 
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-cake-primary", 
            location.pathname === item.path ? "bg-cake-primary" : "text-muted-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-gray-950">{item.name}</span>
        </Link>
      ))}
      
      {visibleAdminItems.length > 0 && (
        <>
          <Separator className="my-4" />
          {visibleAdminItems.map(item => (
            <Link 
              key={item.name} 
              to={item.path} 
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-cake-primary", 
                location.pathname === item.path ? "bg-cake-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-gray-950">{item.name}</span>
            </Link>
          ))}
        </>
      )}
    </div>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  extraHeaderContent
}) => {
  return (
    <SidebarProvider>
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
          <div className="mt-auto p-4 bg-rose-200">
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
            <div className="flex items-center gap-3">
              {extraHeaderContent}
              <OnlineStatusIndicator />
              <Clock />
            </div>
          </div>
          <div className="p-4">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
