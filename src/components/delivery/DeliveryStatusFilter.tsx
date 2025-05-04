
import { Button } from "@/components/ui/button";
import { Truck, Package, CheckCircle2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type DeliveryStatusFilterProps = {
  value: 'ready' | 'in-transit' | 'delivery-statuses' | 'all-statuses';
  onChange: (value: 'ready' | 'in-transit' | 'delivery-statuses' | 'all-statuses') => void;
};

const DeliveryStatusFilter = ({ value, onChange }: DeliveryStatusFilterProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <span className="text-sm font-medium">Delivery Status</span>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-24",
            value === 'ready' && "bg-green-100 text-green-800 border-green-200"
          )}
          onClick={() => onChange('ready')}
        >
          <Package className="h-4 w-4 mr-2" />
          Ready
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-24", 
            value === 'in-transit' && "bg-orange-100 text-orange-800 border-orange-200"
          )}
          onClick={() => onChange('in-transit')}
        >
          <Truck className="h-4 w-4 mr-2" />
          In Transit
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-24",
            value === 'delivery-statuses' && "bg-blue-100 text-blue-800 border-blue-200"
          )}
          onClick={() => onChange('delivery-statuses')}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Delivery Only
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-24",
            value === 'all-statuses' && "bg-purple-100 text-purple-800 border-purple-200"
          )}
          onClick={() => onChange('all-statuses')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          All Orders
        </Button>
      </div>
    </div>
  );
};

export default DeliveryStatusFilter;
