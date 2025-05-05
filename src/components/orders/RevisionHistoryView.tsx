
import { CakeRevision } from "@/types";
import { formatDistance } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface RevisionHistoryViewProps {
  revisions: CakeRevision[];
  maxVisibleRevisions?: number;
}

const RevisionHistoryView = ({ 
  revisions, 
  maxVisibleRevisions = 3 
}: RevisionHistoryViewProps) => {
  const [showAll, setShowAll] = useState(false);
  
  // Sort revisions by timestamp (newest first)
  const sortedRevisions = [...revisions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Calculate which revisions to display based on showAll flag
  const displayRevisions = showAll ? 
    sortedRevisions : 
    sortedRevisions.slice(0, maxVisibleRevisions);
  
  const hasMoreRevisions = sortedRevisions.length > maxVisibleRevisions;

  return (
    <div className="space-y-6">
      {sortedRevisions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No revision history</p>
      ) : (
        <>
          {displayRevisions.map((revision, index) => (
            <div key={revision.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full mr-2 text-xs font-medium",
                    "bg-amber-100 text-amber-800"
                  )}>
                    {sortedRevisions.length - index}
                  </span>
                  <h3 className="font-medium">
                    Revision {sortedRevisions.length - index}
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistance(new Date(revision.timestamp), new Date(), { addSuffix: true })}
                </span>
              </div>
              
              {revision.notes && (
                <div className="bg-muted p-2 rounded-md text-sm ml-8">
                  <p className="italic">"{revision.notes}"</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 ml-8 mt-2">
                {revision.photos.map((photo, photoIndex) => (
                  <div key={photoIndex} className="relative">
                    <img 
                      src={photo} 
                      alt={`Revision ${sortedRevisions.length - index} photo ${photoIndex + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                ))}
              </div>
              
              {index < displayRevisions.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
          
          {hasMoreRevisions && (
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center mt-2"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show All {sortedRevisions.length} Revisions
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default RevisionHistoryView;
