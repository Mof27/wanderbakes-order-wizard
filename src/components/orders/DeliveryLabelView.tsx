
import React, { forwardRef } from 'react';
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
    
    console.log("DeliveryLabelView rendering", { 
      hasPreloadedSettings: !!preloadedSettings,
      hasSettings: !!settings,
      isLoading
    });

    if (isLoading || !settings) {
      console.log("Showing skeleton while loading settings");
      return (
        <div ref={ref} className="print-delivery-label bg-white p-4 shadow-lg" style={{ width: '4in', height: '6in' }}>
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

    console.log("Rendering delivery label with settings", {
      hasTemplate: !!settings.deliveryLabelTemplate,
      templateSections: settings.deliveryLabelTemplate?.sections?.length
    });

    return (
      <DeliveryLabelTemplateRenderer
        ref={ref}
        template={settings.deliveryLabelTemplate}
        order={order}
      />
    );
  }
);

DeliveryLabelView.displayName = 'DeliveryLabelView';

export default DeliveryLabelView;
