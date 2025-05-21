
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Check, Database, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/services/supabase/client";

export default function DataMigrationTool() {
  const { isConfigured } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [migrationStats, setMigrationStats] = useState<{
    customers?: { total: number, migrated: number, timestamp?: Date },
  } | null>(null);
  
  // Load migration stats on mount
  useEffect(() => {
    const loadMigrationStats = async () => {
      try {
        if (isConfigured) {
          // Check if any customers exist in Supabase to determine if migration happened
          const { data: customers, error } = await supabase
            .from('customers')
            .select('id')
            .limit(1);
          
          if (error) throw error;
          
          if (customers && customers.length > 0) {
            // Get total count
            const { count, error: countError } = await supabase
              .from('customers')
              .select('id', { count: 'exact', head: true });
              
            if (countError) throw countError;
            
            setMigrationStats({
              customers: {
                total: count || 0,
                migrated: count || 0,
                timestamp: new Date() // We don't store the timestamp yet, but we can indicate migration happened
              }
            });
          }
        }
      } catch (error) {
        console.error("Failed to load migration stats:", error);
      }
    };
    
    loadMigrationStats();
  }, [isConfigured]);
  
  const handleMigrateCustomers = async () => {
    if (!isConfigured) {
      toast.error("Supabase is not configured. Cannot migrate data.");
      return;
    }
    
    setIsMigrating(true);
    setProgress(0);
    setStatus("Starting customer data migration...");
    
    try {
      // Get all mock customers
      const mockDataService = await import("@/services/mock").then(m => m.mockDataService);
      const customers = await mockDataService.customers.getAll();
      
      if (customers.length === 0) {
        setStatus("No customer data to migrate.");
        setProgress(100);
        toast.info("No customer data to migrate");
        setIsMigrating(false);
        return;
      }
      
      setStatus(`Migrating ${customers.length} customers...`);
      
      // Migrate each customer
      let migratedCount = 0;
      for (const customer of customers) {
        setStatus(`Migrating customer: ${customer.name}`);
        
        try {
          // Check if customer with this WhatsApp number already exists
          const { data: existingCustomers } = await supabase
            .from('customers')
            .select('id')
            .eq('whatsappnumber', customer.whatsappNumber);
            
          if (existingCustomers && existingCustomers.length > 0) {
            console.log(`Customer with WhatsApp number ${customer.whatsappNumber} already exists, skipping.`);
            migratedCount++;
            setProgress((migratedCount / customers.length) * 100);
            continue;
          }
          
          // Remove the id and createdAt to let Supabase generate them
          const { id, createdAt, updatedAt, ...customerData } = customer;
          
          // Insert customer
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({
              name: customerData.name,
              whatsappnumber: customerData.whatsappNumber,
              email: customerData.email || null
            })
            .select('id')
            .single();
            
          if (customerError) throw customerError;
          
          // Insert addresses if they exist
          if (customerData.addresses && customerData.addresses.length > 0) {
            for (const address of customerData.addresses) {
              const { id: addressId, createdAt: addressCreatedAt, ...addressData } = address;
              
              const { error: addressError } = await supabase
                .from('addresses')
                .insert({
                  customer_id: newCustomer.id,
                  text: addressData.text,
                  area: addressData.area,
                  delivery_notes: addressData.deliveryNotes || null
                });
                
              if (addressError) {
                console.error("Failed to migrate address:", address, addressError);
              }
            }
          }
          
          migratedCount++;
          setProgress((migratedCount / customers.length) * 100);
        } catch (error) {
          console.error("Failed to migrate customer:", customer, error);
          toast.error(`Failed to migrate customer: ${customer.name}`);
        }
      }
      
      setStatus(`Migration complete. Migrated ${migratedCount} of ${customers.length} customers.`);
      toast.success(`Migration complete. Migrated ${migratedCount} of ${customers.length} customers.`);
      
      // Update migration stats
      setMigrationStats({
        customers: {
          total: customers.length,
          migrated: migratedCount,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error("Migration failed:", error);
      setStatus("Migration failed. See console for details.");
      toast.error("Migration failed");
    } finally {
      setIsMigrating(false);
      // Force refresh data service to use the newly migrated data
      dataService.setMode('supabase');
    }
  };
  
  const handleRefreshStats = async () => {
    if (!isConfigured) return;
    
    try {
      const { count, error } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true });
        
      if (error) throw error;
      
      setMigrationStats({
        customers: {
          total: migrationStats?.customers?.total || 0,
          migrated: count || 0,
          timestamp: new Date()
        }
      });
      
      toast.success("Migration stats refreshed");
    } catch (error) {
      console.error("Failed to refresh stats:", error);
      toast.error("Failed to refresh migration stats");
    }
  };
  
  if (!isConfigured) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Supabase not configured</AlertTitle>
        <AlertDescription>
          You need to configure Supabase connection before you can migrate data. 
          Please click the Supabase button in the top right corner to connect.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Migration Tool
        </CardTitle>
        <CardDescription>
          Migrate your data from mock storage to Supabase database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Step 1: Migrate Customers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will copy all your customer data from mock storage to Supabase.
              Existing customers with the same WhatsApp number will be skipped.
            </p>
            
            {migrationStats?.customers?.migrated && migrationStats.customers.migrated > 0 ? (
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <div className="flex justify-between w-full items-center">
                  <div>
                    <AlertTitle className="text-blue-700">Migration Status</AlertTitle>
                    <AlertDescription className="text-blue-600">
                      {migrationStats.customers.migrated} customers have been migrated to Supabase.
                    </AlertDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefreshStats} className="flex items-center gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </Button>
                </div>
              </Alert>
            ) : null}
            
            {isMigrating && (
              <div className="space-y-2 mb-4">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{status}</p>
              </div>
            )}
            
            <Button
              onClick={handleMigrateCustomers}
              disabled={isMigrating}
              className="flex items-center gap-2"
            >
              {isMigrating ? (
                "Migrating..."
              ) : (
                <>
                  Migrate Customers
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          
          {progress === 100 && !isMigrating && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Migration Complete</AlertTitle>
              <AlertDescription className="text-green-600">
                Customer data has been successfully migrated to Supabase.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Note: This is a one-way migration. Data will be copied to Supabase but will remain in mock storage as well.
          Future operations will use Supabase data if Supabase mode is active.
        </p>
      </CardFooter>
    </Card>
  );
}
