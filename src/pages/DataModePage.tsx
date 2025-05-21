
import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { dataService } from "@/services";
import { Badge } from "@/components/ui/badge";
import DataMigrationTool from "@/components/settings/DataMigrationTool";
import DataModeIndicator from "@/components/settings/DataModeIndicator";

const DataModePage = () => {
  const { isConfigured } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>Data Mode Settings | Cake Shop</title>
      </Helmet>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Mode Settings</CardTitle>
            <CardDescription>
              Configure how your app stores and retrieves data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Current Data Mode</h3>
              <div className="flex items-center gap-2">
                <DataModeIndicator />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Repository Implementation Status</h3>
              <p className="text-sm text-muted-foreground mb-4">
                The following repositories are currently implemented in Supabase:
              </p>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <span>Customers Repository</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Implemented</Badge>
                </div>
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <span>Gallery Repository</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Implemented</Badge>
                </div>
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <span>Orders Repository</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                </div>
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <span>Settings Repository</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                </div>
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <span>Baker Repository</span>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                </div>
              </div>
            </div>
            
            {isConfigured && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Data Migration</h3>
                <DataMigrationTool />
              </div>
            )}
            
            {!isConfigured && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-2">Connect to Supabase</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To use Supabase for data storage, click the Supabase button in the top right corner of the app.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DataModePage;
