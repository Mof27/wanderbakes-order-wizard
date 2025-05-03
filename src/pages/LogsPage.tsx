
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import LogList from "@/components/logs/LogList";
import { useApp } from "@/context/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { File, Download } from "lucide-react";

const LogsPage = () => {
  const { activeUser, setActiveUser } = useApp();
  const [userName, setUserName] = useState(activeUser);
  
  const handleChangeUser = () => {
    if (userName.trim()) {
      setActiveUser(userName.trim());
    }
  };
  
  // Future functionality could include exporting logs to CSV
  const handleExportLogs = () => {
    // This would be implemented later
    alert("Export functionality will be added in a future update");
  };
  
  return (
    <div className="space-y-6">
      <Helmet>
        <title>Activity Logs | Cake Shop</title>
      </Helmet>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Activity Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all changes to orders and customers
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1" 
            onClick={handleExportLogs}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Logs</span>
          </Button>
        </div>
      </div>
      
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="text-sm font-medium">Current User:</div>
          <div className="flex w-full sm:w-auto gap-2">
            <Input 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter user name"
              className="w-full sm:w-auto"
            />
            <Button 
              onClick={handleChangeUser}
              disabled={!userName.trim() || userName === activeUser}
            >
              Set
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 sm:mt-0 sm:ml-4">
            Changes will be recorded under this username
          </div>
        </div>
      </div>
      
      <LogList />
    </div>
  );
};

export default LogsPage;
