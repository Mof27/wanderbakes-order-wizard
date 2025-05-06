
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Package, 
  CheckCircle2, 
  Calendar, 
  CheckSquare2, 
  AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilterValue = 'ready' | 'in-transit' | 'pending-approval' | 'needs-revision' | 'delivery-statuses' | 'all-statuses';

interface CompactDeliveryStatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}

const CompactDeliveryStatusFilter: React.FC<CompactDeliveryStatusFilterProps> = ({ 
  value, 
  onChange 
}) => {
  const statusOptions = [
    { value: 'ready', label: 'Ready', icon: Package, className: "bg-green-100 text-green-800 border-green-200" },
    { value: 'in-transit', label: 'In Transit', icon: Truck, className: "bg-orange-100 text-orange-800 border-orange-200" },
    { value: 'pending-approval', label: 'Needs Approval', icon: CheckSquare2, className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { value: 'needs-revision', label: 'Needs Revision', icon: AlertTriangle, className: "bg-amber-100 text-amber-800 border-amber-200" },
    { value: 'delivery-statuses', label: 'Delivery Only', icon: CheckCircle2, className: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: 'all-statuses', label: 'All Orders', icon: Calendar, className: "bg-purple-100 text-purple-800 border-purple-200" }
  ];

  const selectedOption = statusOptions.find(option => option.value === value) || statusOptions[0];
  const Icon = selectedOption.icon;

  return (
    <div className="w-full">
      <span className="text-sm font-medium mb-2 block">Delivery Status</span>

      {/* Desktop version */}
      <div className="hidden md:flex flex-wrap gap-2">
        {statusOptions.map(option => {
          const OptionIcon = option.icon;
          return (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              className={cn(
                "min-w-24",
                value === option.value && option.className
              )}
              onClick={() => onChange(option.value as StatusFilterValue)}
            >
              <OptionIcon className="h-4 w-4 mr-2" />
              {option.label}
            </Button>
          );
        })}
      </div>

      {/* Mobile version */}
      <div className="block md:hidden w-full">
        <Select 
          value={value} 
          onValueChange={(val) => onChange(val as StatusFilterValue)}
        >
          <SelectTrigger className="w-full">
            <Icon className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => {
              const OptionIcon = option.icon;
              return (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className={cn("flex items-center", option.value === value && option.className)}
                >
                  <div className="flex items-center">
                    <OptionIcon className="h-4 w-4 mr-2" />
                    {option.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CompactDeliveryStatusFilter;
