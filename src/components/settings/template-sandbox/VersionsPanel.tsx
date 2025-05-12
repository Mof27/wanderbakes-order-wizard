
import { useState } from "react";
import { TemplateVersion } from "@/types/template";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ArrowDown, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface VersionsPanelProps {
  versions: TemplateVersion[];
  currentVersionId: string | null;
  onLoadVersion: (version: TemplateVersion) => void;
  onSetActive: (versionId: string) => void;
}

const VersionsPanel: React.FC<VersionsPanelProps> = ({ 
  versions, 
  currentVersionId,
  onLoadVersion,
  onSetActive
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (versions.length === 0) {
    return (
      <div className="p-2">
        <p className="text-sm text-muted-foreground">No saved versions yet.</p>
      </div>
    );
  }
  
  const sortedVersions = [...versions].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Template Versions</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
      </div>
      
      {isExpanded ? (
        <ScrollArea className="h-40">
          <div className="space-y-1.5">
            {sortedVersions.map((version) => (
              <div 
                key={version.id}
                className={cn(
                  "border rounded-md p-2 cursor-pointer hover:bg-accent transition-colors",
                  version.id === currentVersionId && "bg-accent",
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm truncate max-w-[170px]">
                    {version.name}
                  </span>
                  {version.isActive && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {formatDate(version.createdAt)}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-7 text-xs flex-1"
                    onClick={() => onLoadVersion(version)}
                  >
                    <Copy className="w-3 h-3 mr-1" /> Load
                  </Button>
                  {!version.isActive && (
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-7 text-xs flex-1"
                      onClick={() => onSetActive(version.id)}
                    >
                      <Check className="w-3 h-3 mr-1" /> Set Active
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-sm p-2">
          {sortedVersions.length === 1 ? (
            <p className="text-muted-foreground">1 saved version</p>
          ) : (
            <p className="text-muted-foreground">{sortedVersions.length} saved versions</p>
          )}
          <Button 
            variant="link"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="px-0 h-auto text-xs"
          >
            Show All <ArrowDown className="h-3 w-3 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VersionsPanel;
