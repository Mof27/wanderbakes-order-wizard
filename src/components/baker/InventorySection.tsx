
import React from 'react';
import { CakeInventoryItem } from '@/types/baker';
import InventoryCard from './InventoryCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface InventorySectionProps {
  inventory: CakeInventoryItem[];
}

const InventorySection: React.FC<InventorySectionProps> = ({ inventory }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter inventory items based on search term
  const filteredItems = React.useMemo(() => {
    if (!searchTerm) return inventory;
    
    const lowerSearch = searchTerm.toLowerCase();
    return inventory.filter(item => 
      item.cakeShape.toLowerCase().includes(lowerSearch) ||
      item.cakeSize.toLowerCase().includes(lowerSearch) ||
      item.cakeFlavor.toLowerCase().includes(lowerSearch)
    );
  }, [inventory, searchTerm]);

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredItems.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md border border-dashed">
          <p className="text-muted-foreground">No inventory items found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <InventoryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InventorySection;
