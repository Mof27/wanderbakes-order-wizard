
import { CakeRevision } from "@/types";
import { formatDistance } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface RevisionHistoryViewProps {
  revisions: CakeRevision[];
}

const RevisionHistoryView = ({ revisions }: RevisionHistoryViewProps) => {
  // Sort revisions by timestamp (newest first)
  const sortedRevisions = [...revisions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      {sortedRevisions.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No revision history</p>
      ) : (
        sortedRevisions.map((revision, index) => (
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
            
            {index < sortedRevisions.length - 1 && (
              <Separator className="my-4" />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default RevisionHistoryView;
