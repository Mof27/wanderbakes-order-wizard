
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataService } from "@/services";
import { DriverSettings } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, User } from "lucide-react";

// Form schema for driver settings
const driverSettingsSchema = z.object({
  driver1Name: z.string().min(1, "Driver 1 name is required"),
  driver2Name: z.string().min(1, "Driver 2 name is required")
});

type DriverSettingsFormValues = z.infer<typeof driverSettingsSchema>;

const DeliverySettings = () => {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch current settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.settings.getAll()
  });

  // Create form with existing values
  const form = useForm<DriverSettingsFormValues>({
    resolver: zodResolver(driverSettingsSchema),
    defaultValues: {
      driver1Name: settings?.driverSettings?.driver1Name || "Driver 1",
      driver2Name: settings?.driverSettings?.driver2Name || "Driver 2"
    },
    values: {
      driver1Name: settings?.driverSettings?.driver1Name || "Driver 1",
      driver2Name: settings?.driverSettings?.driver2Name || "Driver 2"
    }
  });

  // Mutation for updating driver settings
  const updateDriverSettingsMutation = useMutation({
    mutationFn: (data: DriverSettings) => dataService.settings.updateDriverSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success("Driver settings updated successfully");
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error updating driver settings:", error);
      toast.error("Failed to update driver settings");
      setIsLoading(false);
    }
  });

  // Form submission handler
  const onSubmit = (data: DriverSettingsFormValues) => {
    setIsLoading(true);
    updateDriverSettingsMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Driver Settings
        </CardTitle>
        <CardDescription>
          Customize the driver names for your business. These names will be used throughout the application for driver assignments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="driver1Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <User className="h-4 w-4" /> Driver 1 Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter driver 1 name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="driver2Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <User className="h-4 w-4" /> Driver 2 Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter driver 2 name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading || isLoadingSettings}>
                {isLoading ? "Saving..." : "Save Driver Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DeliverySettings;
