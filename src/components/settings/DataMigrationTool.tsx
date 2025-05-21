
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { dataService } from '@/services';
import { Loader2, Check, X, ArrowUpFromLine } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer, Order } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle } from 'lucide-react';

type MigrationStatus = 'idle' | 'running' | 'completed' | 'failed';

interface MigrationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
}

const DataMigrationTool = () => {
  const [customerMigrationStatus, setCustomerMigrationStatus] = useState<MigrationStatus>('idle');
  const [orderMigrationStatus, setOrderMigrationStatus] = useState<MigrationStatus>('idle');
  const [customerProgress, setCustomerProgress] = useState<MigrationProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0
  });
  const [orderProgress, setOrderProgress] = useState<MigrationProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0
  });

  // Function to check if table already has data
  const checkIfTableHasData = async (tableName: string): Promise<boolean> => {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error(`Error checking ${tableName} table:`, error);
      return false;
    }
    
    return (count || 0) > 0;
  };

  // Function to migrate customers
  const migrateCustomers = async () => {
    try {
      setCustomerMigrationStatus('running');
      setCustomerProgress({ total: 0, processed: 0, successful: 0, failed: 0 });
      
      // Check if customers table already has data
      const hasCustomers = await checkIfTableHasData('customers');
      
      if (hasCustomers) {
        const confirmation = window.confirm('The customers table already has data. Running this migration will add more customers, potentially causing duplicates. Do you want to proceed?');
        if (!confirmation) {
          setCustomerMigrationStatus('idle');
          return;
        }
      }
      
      // Get all customers from mock service
      const mockDataService = await import('../../services/mock');
      const customers = await mockDataService.mockDataService.customers.getAll();
      
      setCustomerProgress(prev => ({ ...prev, total: customers.length }));
      
      let successful = 0;
      let failed = 0;
      
      // Process each customer
      for (let i = 0; i < customers.length; i++) {
        try {
          const customer = customers[i];
          
          // Check if customer with this WhatsApp number already exists
          const { data: existingCustomers, error: checkError } = await supabase
            .from('customers')
            .select('id')
            .eq('whatsappnumber', customer.whatsappNumber)
            .limit(1);
            
          if (checkError) throw checkError;
          
          // If customer already exists, skip
          if (existingCustomers && existingCustomers.length > 0) {
            console.log(`Customer with WhatsApp ${customer.whatsappNumber} already exists, skipping`);
            setCustomerProgress(prev => ({
              ...prev,
              processed: prev.processed + 1,
              successful: prev.successful + 1
            }));
            successful++;
            continue;
          }
          
          // Create customer in Supabase
          await dataService.customers.create({
            name: customer.name,
            whatsappNumber: customer.whatsappNumber,
            email: customer.email,
            addresses: customer.addresses || []
          });
          
          successful++;
          setCustomerProgress(prev => ({
            ...prev,
            processed: prev.processed + 1,
            successful: prev.successful + 1
          }));
        } catch (error) {
          console.error('Error migrating customer:', error);
          failed++;
          setCustomerProgress(prev => ({
            ...prev,
            processed: prev.processed + 1,
            failed: prev.failed + 1
          }));
        }
      }
      
      setCustomerMigrationStatus('completed');
      toast.success(`Customer migration completed: ${successful} succeeded, ${failed} failed`);
    } catch (error) {
      console.error('Customer migration error:', error);
      setCustomerMigrationStatus('failed');
      toast.error('Customer migration failed');
    }
  };

  // Function to migrate orders
  const migrateOrders = async () => {
    try {
      setOrderMigrationStatus('running');
      setOrderProgress({ total: 0, processed: 0, successful: 0, failed: 0 });
      
      // Check if orders table already has data
      const hasOrders = await checkIfTableHasData('orders');
      
      if (hasOrders) {
        const confirmation = window.confirm('The orders table already has data. Running this migration will add more orders, potentially causing duplicates. Do you want to proceed?');
        if (!confirmation) {
          setOrderMigrationStatus('idle');
          return;
        }
      }
      
      // Get all orders from mock service
      const mockDataService = await import('../../services/mock');
      const orders = await mockDataService.mockDataService.orders.getAll();
      
      setOrderProgress(prev => ({ ...prev, total: orders.length }));
      
      let successful = 0;
      let failed = 0;
      
      // Process each order
      for (let i = 0; i < orders.length; i++) {
        try {
          const order = orders[i];
          
          // Check if order with this ID already exists
          const { data: existingOrders, error: checkError } = await supabase
            .from('orders')
            .select('id')
            .eq('id', order.id)
            .limit(1);
            
          if (checkError) throw checkError;
          
          // If order already exists, skip
          if (existingOrders && existingOrders.length > 0) {
            console.log(`Order ${order.id} already exists, skipping`);
            setOrderProgress(prev => ({
              ...prev,
              processed: prev.processed + 1,
              successful: prev.successful + 1
            }));
            successful++;
            continue;
          }
          
          // Map and transform the order as needed
          // Make sure the customer exists in Supabase first
          const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('whatsappnumber', order.customer.whatsappNumber)
            .maybeSingle();
          
          let customerId = existingCustomer?.id;
          
          // If customer doesn't exist, create it
          if (!customerId) {
            const newCustomer = await dataService.customers.create({
              name: order.customer.name,
              whatsappNumber: order.customer.whatsappNumber,
              email: order.customer.email,
              addresses: order.customer.addresses || []
            });
            customerId = newCustomer.id;
          }
          
          // Create the order directly using the repository
          // Assuming we've imported from services/repositories/supabase/order.repository
          const { SupabaseOrderRepository } = await import('../../services/repositories/supabase/order.repository');
          const orderRepo = new SupabaseOrderRepository();
          
          // Transform the order for Supabase - making sure customer id is correct
          const transformedOrder = {
            ...order,
            customer: {
              ...order.customer,
              id: customerId
            }
          };
          
          // Remove the id from the order to let repository assign it
          // but preserve the existing ID pattern
          const { id, ...orderWithoutId } = transformedOrder;
          
          // Check if we can preserve the existing ID
          const { data: existingIdCheck } = await supabase
            .from('orders')
            .select('id')
            .eq('id', id)
            .maybeSingle();
          
          let createdOrder: Order;
          
          if (existingIdCheck) {
            // ID already exists, let the repository generate a new one
            createdOrder = await orderRepo.create(orderWithoutId);
          } else {
            // We can use the existing ID - insert directly
            const { data: insertedOrder, error: insertError } = await supabase
              .from('orders')
              .insert({
                id: id,
                customer_id: customerId,
                status: order.status,
                kitchen_status: order.kitchenStatus,
                order_date: order.orderDate,
                delivery_date: order.deliveryDate,
                delivery_address: order.deliveryAddress,
                delivery_address_notes: order.deliveryAddressNotes,
                delivery_area: order.deliveryArea,
                cake_design: order.cakeDesign,
                cake_flavor: order.cakeFlavor,
                cake_size: order.cakeSize,
                cake_shape: order.cakeShape,
                custom_shape: order.customShape,
                cake_tier: order.cakeTier,
                use_same_flavor: order.useSameFlavor,
                use_same_cover: order.useSameCover !== undefined ? order.useSameCover : true,
                cake_text: order.cakeText,
                greeting_card: order.greetingCard,
                notes: order.notes,
                cake_price: order.cakePrice,
                delivery_method: order.deliveryMethod,
                delivery_time_slot: order.deliveryTimeSlot,
                delivery_price: order.deliveryPrice,
                actual_delivery_time: order.actualDeliveryTime,
                customer_feedback: order.customerFeedback,
                archived_date: order.archivedDate,
                created_at: order.createdAt,
                updated_at: order.updatedAt,
                cover_type: order.coverType,
                revision_count: order.revisionCount || 0,
                revision_notes: order.revisionNotes,
                approved_by: order.approvedBy,
                approval_date: order.approvalDate
              })
              .select('*')
              .single();
              
            if (insertError) throw insertError;
            
            // Now we insert all the related data
            // Cover colors
            if (order.coverColors && order.coverColors.length > 0) {
              for (const color of order.coverColors) {
                await supabase.from('order_cover_colors').insert({
                  order_id: id,
                  type: color.type,
                  color: color.color,
                  colors: color.colors,
                  notes: color.notes,
                  image_url: color.imageUrl
                });
              }
            }
            
            // Tier details
            if (order.tierDetails && order.tierDetails.length > 0) {
              for (const tier of order.tierDetails) {
                const { data: tierData } = await supabase
                  .from('order_tier_details')
                  .insert({
                    order_id: id,
                    tier: tier.tier,
                    shape: tier.shape,
                    size: tier.size,
                    height: tier.height,
                    flavor: tier.flavor,
                    cover_type: tier.coverType,
                    custom_shape: tier.customShape
                  })
                  .select('id')
                  .single();
                  
                if (tierData && tier.coverColors && tier.coverColors.length > 0) {
                  for (const color of tier.coverColors) {
                    await supabase.from('tier_detail_cover_colors').insert({
                      tier_detail_id: tierData.id,
                      type: color.type,
                      color: color.color,
                      colors: color.colors,
                      notes: color.notes,
                      image_url: color.imageUrl
                    });
                  }
                }
              }
            }
            
            // Packing items
            if (order.packingItems && order.packingItems.length > 0) {
              for (const item of order.packingItems) {
                await supabase.from('order_packing_items').insert({
                  order_id: id,
                  name: item.name,
                  checked: item.checked || false
                });
              }
            }
            
            // Ingredients
            if (order.ingredients && order.ingredients.length > 0) {
              for (const ingredient of order.ingredients) {
                await supabase.from('order_ingredients').insert({
                  order_id: id,
                  name: ingredient.name,
                  quantity: ingredient.quantity,
                  unit: ingredient.unit
                });
              }
            }
            
            // Order logs
            if (order.orderLogs && order.orderLogs.length > 0) {
              for (const log of order.orderLogs) {
                await supabase.from('order_logs').insert({
                  id: log.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  order_id: id,
                  timestamp: log.timestamp,
                  type: log.type,
                  previous_status: log.previousStatus,
                  new_status: log.newStatus,
                  user_name: log.userName,
                  note: log.note,
                  metadata: log.metadata
                });
              }
            }
            
            // Print history
            if (order.printHistory && order.printHistory.length > 0) {
              for (const print of order.printHistory) {
                await supabase.from('order_print_history').insert({
                  order_id: id,
                  type: print.type,
                  timestamp: print.timestamp,
                  user_name: print.userName
                });
              }
            }
            
            // Revision history
            if (order.revisionHistory && order.revisionHistory.length > 0) {
              for (const revision of order.revisionHistory) {
                await supabase.from('order_revision_history').insert({
                  id: revision.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                  order_id: id,
                  timestamp: revision.timestamp,
                  photos: revision.photos,
                  notes: revision.notes,
                  requested_by: revision.requestedBy
                });
              }
            }
            
            // Delivery assignment
            if (order.deliveryAssignment) {
              await supabase.from('order_delivery_assignments').insert({
                order_id: id,
                driver_type: order.deliveryAssignment.driverType,
                driver_name: order.deliveryAssignment.driverName,
                assigned_at: order.deliveryAssignment.assignedAt,
                is_preliminary: order.deliveryAssignment.isPreliminary,
                notes: order.deliveryAssignment.notes,
                vehicle_info: order.deliveryAssignment.vehicleInfo
              });
            }
            
            createdOrder = await orderRepo.getById(id) as Order;
          }
          
          successful++;
          setOrderProgress(prev => ({
            ...prev,
            processed: prev.processed + 1,
            successful: prev.successful + 1
          }));
        } catch (error) {
          console.error('Error migrating order:', error);
          failed++;
          setOrderProgress(prev => ({
            ...prev,
            processed: prev.processed + 1,
            failed: prev.failed + 1
          }));
        }
      }
      
      setOrderMigrationStatus('completed');
      toast.success(`Order migration completed: ${successful} succeeded, ${failed} failed`);
    } catch (error) {
      console.error('Order migration error:', error);
      setOrderMigrationStatus('failed');
      toast.error('Order migration failed');
    }
  };

  const getProgressPercentage = (progress: MigrationProgress) => {
    return progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;
  };

  const renderMigrationCard = (
    title: string,
    description: string,
    status: MigrationStatus,
    progress: MigrationProgress,
    onMigrate: () => void
  ) => {
    const progressPercentage = getProgressPercentage(progress);
    const isRunning = status === 'running';
    const isCompleted = status === 'completed';
    const isFailed = status === 'failed';

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title}
            {isCompleted && <Check className="h-5 w-5 text-green-500" />}
            {isFailed && <X className="h-5 w-5 text-red-500" />}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {(isRunning || isCompleted || isFailed) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {progress.processed} / {progress.total}</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-600">Success: {progress.successful}</span>
                <span className="text-red-600">Failed: {progress.failed}</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={onMigrate} 
            disabled={isRunning}
            className="w-full"
            variant={isCompleted ? "outline" : (isFailed ? "destructive" : "default")}
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isRunning && !isCompleted && !isFailed && <ArrowUpFromLine className="mr-2 h-4 w-4" />}
            {!isRunning && isCompleted && "Migrate Again"}
            {!isRunning && isFailed && "Retry Migration"}
            {isRunning && "Migrating..."}
            {!isRunning && !isCompleted && !isFailed && "Start Migration"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Migration Tool</AlertTitle>
        <AlertDescription>
          This tool helps you migrate data from mock services to Supabase. The migration process may take some time depending on the amount of data.
          It's recommended to run the customer migration first, followed by orders.
        </AlertDescription>
      </Alert>

      {renderMigrationCard(
        "Customer Migration",
        "Migrate customer data from mock service to Supabase",
        customerMigrationStatus,
        customerProgress,
        migrateCustomers
      )}

      {renderMigrationCard(
        "Order Migration",
        "Migrate order data from mock service to Supabase (requires customers to be migrated first)",
        orderMigrationStatus,
        orderProgress,
        migrateOrders
      )}
    </div>
  );
};

export default DataMigrationTool;
