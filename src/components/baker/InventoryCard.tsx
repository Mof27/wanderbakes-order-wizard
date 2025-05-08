
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CakeInventoryItem } from '@/types/baker';
import { Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface InventoryCardProps {
  item: CakeInventoryItem;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ item }) => {
  return (
    <Card className="bg-white shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium">
              {item.cakeShape} {item.cakeSize}
            </h3>
            <p className="text-sm text-muted-foreground">{item.cakeFlavor}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">In Stock</p>
            <p className={`font-medium ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.quantity} {item.quantity === 1 ? 'cake' : 'cakes'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="text-sm">
              {formatDistanceToNow(item.lastUpdated, { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryCard;
