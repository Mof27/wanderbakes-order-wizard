
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { dataService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, Check, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DataMigrationTool() {
  const { isConfigured } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  
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
          // Remove the id and createdAt to let Supabase generate them
          const { id, createdAt, updatedAt, ...customerData } = customer;
          await dataService.customers.create(customerData as any);
          migratedCount++;
          setProgress((migratedCount / customers.length) * 100);
        } catch (error) {
          console.error("Failed to migrate customer:", customer, error);
          toast.error(`Failed to migrate customer: ${customer.name}`);
        }
      }
      
      setStatus(`Migration complete. Migrated ${migratedCount} of ${customers.length} customers.`);
      toast.success(`Migration complete. Migrated ${migratedCount} of ${customers.length} customers.`);
    } catch (error) {
      console.error("Migration failed:", error);
      setStatus("Migration failed. See console for details.");
      toast.error("Migration failed");
    } finally {
      setIsMigrating(false);
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
              Existing customers with the same WhatsApp number may be duplicated.
            </p>
            
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
            <Alert variant="success" className="bg-green-50 border-green-200">
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
