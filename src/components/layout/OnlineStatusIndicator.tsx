
import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const OnlineStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      <Badge
        variant="outline"
        size="sm"
        className={`flex items-center gap-1 ${
          isOnline 
            ? "bg-green-100 text-green-800 hover:bg-green-100" 
            : "bg-red-100 text-red-800 hover:bg-red-100"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3.5 w-3.5" />
            <span className="text-xs">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            <span className="text-xs">Offline</span>
          </>
        )}
      </Badge>
    </div>
  );
};

export default OnlineStatusIndicator;
