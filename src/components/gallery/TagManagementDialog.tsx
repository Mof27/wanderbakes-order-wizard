
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataService } from "@/services";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Plus, Save, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TagManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagsUpdated?: () => void;
}

const TagManagementDialog = ({
  open,
  onOpenChange,
  onTagsUpdated
}: TagManagementDialogProps) => {
  const queryClient = useQueryClient();
  const [newTagLabel, setNewTagLabel] = useState("");
  
  // Fetch all available tags
  const { data: allTags = [], isLoading } = useQuery({
    queryKey: ['galleryTags'],
    queryFn: () => dataService.gallery.getAllTags(),
    enabled: open
  });
  
  // Split tags into built-in and custom
  const builtInTags = allTags.filter(tag => tag.id.startsWith('builtin-'));
  const customTags = allTags.filter(tag => tag.id.startsWith('custom-tag-'));
  
  // Create new tag mutation
  const createTagMutation = useMutation({
    mutationFn: (label: string) => dataService.gallery.createCustomTag(label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryTags'] });
      setNewTagLabel("");
      toast.success("Tag created successfully");
      if (onTagsUpdated) onTagsUpdated();
    },
    onError: () => {
      toast.error("Failed to create tag");
    }
  });
  
  // Handle new tag creation
  const handleCreateTag = () => {
    if (!newTagLabel.trim()) return;
    
    // Check if tag already exists (case insensitive)
    const normalizedNewTag = newTagLabel.trim().toLowerCase();
    const tagExists = allTags.some(tag => 
      tag.label.toLowerCase() === normalizedNewTag || 
      tag.value.toLowerCase() === normalizedNewTag.replace(/\s+/g, '-')
    );
    
    if (tagExists) {
      toast.error("A tag with this name already exists");
      return;
    }
    
    createTagMutation.mutate(newTagLabel.trim());
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Manage Gallery Tags
          </DialogTitle>
          <DialogDescription>
            View built-in tags and create custom tags for the cake gallery
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Create new tag section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Create New Tag</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag name..."
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateTag();
                  }
                }}
              />
              <Button 
                onClick={handleCreateTag}
                disabled={!newTagLabel.trim() || createTagMutation.isPending}
              >
                {createTagMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Tag
              </Button>
            </div>
          </div>
          
          {/* Tags tables */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Custom tags */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Custom Tags</h3>
                {customTags.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tag</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customTags.map(tag => (
                        <TableRow key={tag.id}>
                          <TableCell>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200">
                              {tag.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {tag.value}
                          </TableCell>
                          <TableCell>{tag.count}</TableCell>
                          <TableCell>{formatDate(tag.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No custom tags have been created yet</p>
                )}
              </div>
              
              {/* Built-in tags */}
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Built-in Tags</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {builtInTags.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <Badge variant="outline">{tag.label}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {tag.value}
                        </TableCell>
                        <TableCell>{tag.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TagManagementDialog;
