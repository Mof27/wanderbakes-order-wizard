
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dataService } from '@/services';
import { GalleryFilter, GallerySort, CustomTag } from '@/types/gallery';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Search, SlidersHorizontal, ArrowDownAZ, ArrowUpZA, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { OrderTag } from '@/types';

interface GalleryFiltersProps {
  filter: GalleryFilter;
  onFilterChange: (filter: Partial<GalleryFilter>) => void;
  sort: GallerySort;
  onSortChange: (sort: GallerySort) => void;
}

const TagFilterSection = ({ 
  selectedTags,
  onTagsChange,
  availableTags 
}: { 
  selectedTags: OrderTag[];
  onTagsChange: (tags: OrderTag[]) => void;
  availableTags: CustomTag[];
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Tags</h3>
      
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedTags.includes(tag.value as OrderTag) ? "default" : "outline"}
            className="cursor-pointer text-sm py-1 px-2"
            onClick={() => {
              if (selectedTags.includes(tag.value as OrderTag)) {
                onTagsChange(selectedTags.filter(t => t !== tag.value));
              } else {
                onTagsChange([...selectedTags, tag.value as OrderTag]);
              }
            }}
          >
            {tag.label}
            {tag.count > 0 && <span className="ml-1 opacity-70 text-xs">({tag.count})</span>}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const CakePropertyFilterSection = ({ 
  title,
  options,
  selected,
  onChange 
}: { 
  title: string;
  options: { value: string; label: string; count?: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title}</h3>
      
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Badge
            key={option.value}
            variant={selected.includes(option.value) ? "default" : "outline"}
            className="cursor-pointer text-sm py-1 px-2"
            onClick={() => {
              if (selected.includes(option.value)) {
                onChange(selected.filter(s => s !== option.value));
              } else {
                onChange([...selected, option.value]);
              }
            }}
          >
            {option.label}
            {option.count && option.count > 0 && <span className="ml-1 opacity-70 text-xs">({option.count})</span>}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const GalleryFilters = ({ filter, onFilterChange, sort, onSortChange }: GalleryFiltersProps) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch available tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags(),
  });

  // Fetch settings for cake properties
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => dataService.settings.getAll(),
  });

  // Prepare shape options
  const shapeOptions = settings?.cakeShapes
    ?.filter(shape => shape.enabled)
    .map(shape => ({
      value: shape.value,
      label: shape.name
    })) || [];
  
  // Prepare flavor options
  const flavorOptions = settings?.cakeFlavors
    ?.filter(flavor => flavor.enabled)
    .map(flavor => ({
      value: flavor.value,
      label: flavor.name
    })) || [];

  // Handle tag changes
  const handleTagsChange = (tags: OrderTag[]) => {
    onFilterChange({ tags });
  };

  // Handle search query changes
  const handleSearch = () => {
    onFilterChange({ searchQuery });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    onFilterChange({
      tags: [],
      shapes: [],
      flavors: [],
      searchQuery: '',
    });
  };

  // Count active filters
  const activeFilterCount = [
    filter.tags?.length || 0,
    filter.shapes?.length || 0,
    filter.flavors?.length || 0,
    filter.searchQuery ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      {/* Main filter bar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search designs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onBlur={handleSearch}
              />
            </div>

            {/* Filter button + active filter count */}
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side={isMobile ? "bottom" : "right"} className={isMobile ? "h-[80%]" : ""}>
                  <SheetHeader>
                    <SheetTitle>Filter Photos</SheetTitle>
                    <SheetDescription>
                      Refine the gallery based on tags and cake properties
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-6">
                    <TagFilterSection
                      selectedTags={filter.tags || []}
                      onTagsChange={handleTagsChange}
                      availableTags={availableTags}
                    />
                    
                    <Separator />
                    
                    <CakePropertyFilterSection
                      title="Cake Shape"
                      options={shapeOptions}
                      selected={filter.shapes || []}
                      onChange={(shapes) => onFilterChange({ shapes })}
                    />
                    
                    <Separator />
                    
                    <CakePropertyFilterSection
                      title="Cake Flavor"
                      options={flavorOptions}
                      selected={filter.flavors || []}
                      onChange={(flavors) => onFilterChange({ flavors })}
                    />
                    
                    <div className="pt-4">
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={handleClearFilters}
                        disabled={activeFilterCount === 0}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Sort dropdown */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {sort === 'newest' ? (
                      <ArrowDownAZ className="h-4 w-4" />
                    ) : sort === 'oldest' ? (
                      <ArrowUpZA className="h-4 w-4" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Sort
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-1">
                    <Button
                      variant={sort === 'newest' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => onSortChange('newest')}
                    >
                      <ArrowDownAZ className="h-4 w-4 mr-2" />
                      Newest First
                    </Button>
                    <Button
                      variant={sort === 'oldest' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => onSortChange('oldest')}
                    >
                      <ArrowUpZA className="h-4 w-4 mr-2" />
                      Oldest First
                    </Button>
                    <Button
                      variant={sort === 'popular' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => onSortChange('popular')}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Most Popular
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filter.searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  {filter.searchQuery}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => onFilterChange({ searchQuery: '' })}
                  />
                </Badge>
              )}
              
              {filter.tags && filter.tags.map(tag => {
                const tagInfo = availableTags.find(t => t.value === tag);
                return (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tagInfo?.label || tag}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handleTagsChange(filter.tags.filter(t => t !== tag))}
                    />
                  </Badge>
                );
              })}
              
              {filter.shapes && filter.shapes.map(shape => {
                const shapeInfo = shapeOptions.find(s => s.value === shape);
                return (
                  <Badge key={shape} variant="secondary" className="flex items-center gap-1">
                    Shape: {shapeInfo?.label || shape}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => onFilterChange({ shapes: filter.shapes.filter(s => s !== shape) })}
                    />
                  </Badge>
                );
              })}
              
              {filter.flavors && filter.flavors.map(flavor => {
                const flavorInfo = flavorOptions.find(f => f.value === flavor);
                return (
                  <Badge key={flavor} variant="secondary" className="flex items-center gap-1">
                    Flavor: {flavorInfo?.label || flavor}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => onFilterChange({ flavors: filter.flavors.filter(f => f !== flavor) })}
                    />
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default GalleryFilters;
