
import { useState } from "react";
import { OrderLogEvent } from "@/types";
import { formatDistanceToNow, format, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Info, FileText, Clock, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface OrderLogSectionProps {
  logs: OrderLogEvent[];
  orderCreatedAt: Date;
  orderCompletedAt?: Date;
  orderInKitchenAt?: Date;
  orderDeliveredAt?: Date;
}

const OrderLogSection: React.FC<OrderLogSectionProps> = ({ 
  logs, 
  orderCreatedAt,
  orderCompletedAt,
  orderInKitchenAt,
  orderDeliveredAt
}) => {
  const [filter, setFilter] = useState<string | null>(null);

  // Sort logs by timestamp, newest first
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Filter logs based on selected filter
  const filteredLogs = filter 
    ? sortedLogs.filter(log => log.type === filter)
    : sortedLogs;
  
  // Calculate time metrics
  const calculateTimeMetrics = () => {
    const metrics = [];
    
    if (orderCreatedAt) {
      metrics.push({
        label: "Order Age",
        value: formatDistanceToNow(new Date(orderCreatedAt), { addSuffix: false }),
        icon: <Calendar className="h-4 w-4" />,
        tooltip: `Order created on ${format(new Date(orderCreatedAt), 'PPpp')}`
      });
    }
    
    if (orderInKitchenAt && orderCompletedAt) {
      const minutes = differenceInMinutes(
        new Date(orderCompletedAt),
        new Date(orderInKitchenAt)
      );
      const hours = minutes / 60;
      
      metrics.push({
        label: "Production Time",
        value: hours < 1 ? `${minutes} minutes` : `${hours.toFixed(1)} hours`,
        icon: <Clock className="h-4 w-4" />,
        tooltip: `From kitchen (${format(new Date(orderInKitchenAt), 'PPp')}) to completion (${format(new Date(orderCompletedAt), 'PPp')})`
      });
    }
    
    if (orderInKitchenAt && !orderCompletedAt) {
      const minutes = differenceInMinutes(
        new Date(),
        new Date(orderInKitchenAt)
      );
      const hours = minutes / 60;
      
      metrics.push({
        label: "Time in Production",
        value: hours < 1 ? `${minutes} minutes so far` : `${hours.toFixed(1)} hours so far`,
        icon: <Clock className="h-4 w-4" />,
        tooltip: `In kitchen since ${format(new Date(orderInKitchenAt), 'PPp')}`
      });
    }
    
    if (orderCreatedAt && orderDeliveredAt) {
      const days = differenceInDays(
        new Date(orderDeliveredAt),
        new Date(orderCreatedAt)
      );
      
      metrics.push({
        label: "Order to Delivery",
        value: `${days} days`,
        icon: <Calendar className="h-4 w-4" />,
        tooltip: `From order (${format(new Date(orderCreatedAt), 'PP')}) to delivery (${format(new Date(orderDeliveredAt), 'PP')})`
      });
    }
    
    return metrics;
  };
  
  const timeMetrics = calculateTimeMetrics();
  
  // Get icon for log type
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'status-change':
        return <Info className="h-4 w-4" />;
      case 'print':
        return <FileText className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  // Format log message based on log type
  const formatLogMessage = (log: OrderLogEvent) => {
    switch (log.type) {
      case 'status-change':
        return (
          <div className="flex items-center">
            Status changed from{" "}
            {log.previousStatus && <StatusBadge status={log.previousStatus} className="mx-1" />}
            {" to "}
            {log.newStatus && <StatusBadge status={log.newStatus} className="mx-1" />}
          </div>
        );
      case 'photo-upload':
        return "Photos uploaded";
      case 'print':
        return log.note || "Document printed";
      case 'note-added':
        return `Note added: ${log.note}`;
      case 'delivery-update':
        return "Delivery information updated";
      case 'feedback-added':
        return "Customer feedback added";
      default:
        return log.note || "Action performed";
    }
  };

  return (
    <div className="space-y-6">
      {/* Time metrics cards */}
      {timeMetrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeMetrics.map((metric, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div className="bg-muted rounded-lg p-4 flex flex-col">
                  <div className="flex items-center text-muted-foreground mb-1">
                    {metric.icon}
                    <span className="ml-2 text-sm">{metric.label}</span>
                  </div>
                  <span className="text-xl font-medium">{metric.value}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{metric.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Log table */}
      <div>
        <h3 className="text-lg font-medium mb-4">Order History Log</h3>
        
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>{formatLogMessage(log)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {getLogIcon(log.type)}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {log.type.replace('-', ' ')}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No log entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {logs.length === 0 && (
          <div className="text-center mt-4 text-muted-foreground">
            <p>No history logs available for this order</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderLogSection;
