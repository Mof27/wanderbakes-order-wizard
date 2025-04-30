
import React, { forwardRef, useEffect } from 'react';
import { Order, SettingsData } from '@/types';
import { dataService } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import DeliveryLabelTemplateRenderer from '@/components/settings/DeliveryLabelTemplateRenderer';

interface DeliveryLabelViewProps {
  order: Partial<Order>;
  preloadedSettings?: SettingsData;
}

const DeliveryLabelView = forwardRef<HTMLDivElement, DeliveryLabelViewProps>(
  ({ order, preloadedSettings }, ref) => {
    // Only fetch settings if not provided
    const { data: fetchedSettings, isLoading } = useQuery({
      queryKey: ['settings'],
      queryFn: () => dataService.settings.getAll(),
      enabled: !preloadedSettings,
    });

    const settings = preloadedSettings || fetchedSettings;
    
    useEffect(() => {
      console.log("DeliveryLabelView mounted with order:", order.id);
      
      return () => {
        console.log("DeliveryLabelView unmounted");
      };
    }, [order.id]);
    
    console.log("DeliveryLabelView rendering", { 
      hasPreloadedSettings: !!preloadedSettings,
      hasSettings: !!settings,
      isLoading,
      templateSections: settings?.deliveryLabelTemplate?.sections?.length
    });

    if (isLoading || !settings) {
      console.log("Showing skeleton while loading settings");
      return (
        <div 
          ref={ref} 
          className="print-delivery-label bg-white p-4 shadow-lg" 
          style={{ width: '4in', height: '6in', boxSizing: 'border-box' }}
        >
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

    console.log("Rendering delivery label with settings", {
      hasTemplate: !!settings.deliveryLabelTemplate,
      templateSections: settings.deliveryLabelTemplate?.sections?.length
    });

    return (
      <div 
        ref={ref} 
        className="print-delivery-label"
        style={{ width: '4in', height: '6in' }}
      >
        <DeliveryLabelTemplateRenderer
          template={settings.deliveryLabelTemplate}
          order={order}
        />
      </div>
    );
  }
);

DeliveryLabelView.displayName = 'DeliveryLabelView';

export default DeliveryLabelView;
