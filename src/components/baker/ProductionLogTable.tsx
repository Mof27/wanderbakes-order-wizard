
import React from 'react';
import { ProductionLogEntry } from '@/types/baker';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ProductionLogTableProps {
  logs: ProductionLogEntry[];
}

const ProductionLogTable: React.FC<ProductionLogTableProps> = ({ logs }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Cake</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Quality Checks</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No production logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {format(log.completedAt, 'yyyy-MM-dd HH:mm')}
                </TableCell>
                <TableCell>
                  <div>
                    <p>{log.cakeShape} {log.cakeSize}</p>
                    <p className="text-sm text-muted-foreground">{log.cakeFlavor}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {log.cancelled ? '-' : log.quantity}
                </TableCell>
                <TableCell className="text-center">
                  {log.cancelled ? (
                    <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                      Cancelled
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Completed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {log.cancelled ? (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  ) : log.qualityChecks ? (
                    <div className="flex justify-center gap-3">
                      <div className="flex items-center" title="Properly Baked">
                        {log.qualityChecks.properlyBaked ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center" title="Correct Size">
                        {log.qualityChecks.correctSize ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center" title="Good Texture">
                        {log.qualityChecks.goodTexture ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-center block">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {log.cancelled && log.cancellationReason ? (
                    <div>
                      <p className="text-rose-700 text-sm">{log.cancellationReason}</p>
                      {log.notes && <p className="text-muted-foreground text-sm">{log.notes}</p>}
                    </div>
                  ) : (
                    log.notes || <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductionLogTable;
