
import React from "react";
import { Badge } from "@/components/ui/badge";
import { dataService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { Database, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DataModeIndicator() {
  const { isConfigured } = useAuth();
  const dataMode = dataService.currentMode;
  
  const getStatusDetails = () => {
    if (dataMode === 'supabase' && isConfigured) {
      return {
        label: "Supabase",
        variant: "default" as const,
        tooltip: "Your data is stored in Supabase database",
        icon: <Database className="h-4 w-4" />
      };
    } else if (dataMode === 'supabase' && !isConfigured) {
      return {
        label: "Supabase (Not Configured)",
        variant: "destructive" as const,
        tooltip: "Supabase is selected but not properly configured. Using mock data.",
        icon: <Database className="h-4 w-4" />
      };
    } else if (dataMode === 'mock') {
      return {
        label: "Mock Data",
        variant: "secondary" as const,
        tooltip: "Your data is stored locally in memory and will be lost when you refresh the page",
        icon: <Database className="h-4 w-4" />
      };
    } else {
      return {
        label: dataMode,
        variant: "outline" as const,
        tooltip: "Current data service mode",
        icon: <Database className="h-4 w-4" />
      };
    }
  };
  
  const status = getStatusDetails();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant} className="flex items-center gap-2 py-1">
              {status.icon}
              {status.label}
            </Badge>
            <Info size={16} className="text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
