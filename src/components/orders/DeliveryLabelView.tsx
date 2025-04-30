
import React, { forwardRef } from 'react';
import { Order } from '@/types';
import { dataService } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import DeliveryLabelTemplateRenderer from '@/components/settings/DeliveryLabelTemplateRenderer';

interface DeliveryLabelViewProps {
  order: Partial<Order>;
}

const DeliveryLabelView = forwardRef<HTMLDivElement, DeliveryLabelViewProps>(
  ({ order }, ref) => {
    const { data: settings, isLoading } = useQuery({
      queryKey: ['settings'],
      queryFn: () => dataService.settings.getAll()
    });

    if (isLoading || !settings) {
      return (
        <div ref={ref} className="print-delivery-label bg-white p-4 shadow-lg" style={{ width: '4in', height: '6in' }}>
          <Skeleton className="h-full w-full" />
        </div>
      );
    }

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
