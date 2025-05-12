
import { Button } from "@/components/ui/button";
import { SandboxState } from "@/types/template";
import { 
  ZoomIn, 
  ZoomOut, 
  Grid3x3, 
  MoveHorizontal, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Save
} from "lucide-react";

interface SandboxToolbarProps {
  sandboxState: SandboxState;
  onSandboxStateChange: (state: SandboxState) => void;
  onSave: () => void;
  onBack: () => void;
  hasUnsavedChanges: boolean;
}

const SandboxToolbar: React.FC<SandboxToolbarProps> = ({
  sandboxState,
  onSandboxStateChange,
  onSave,
  onBack,
  hasUnsavedChanges
}) => {
  const updateState = (partialState: Partial<SandboxState>) => {
    onSandboxStateChange({
      ...sandboxState,
      ...partialState
    });
  };
  
  const handleZoomIn = () => {
    if (sandboxState.zoom < 200) {
      updateState({ zoom: sandboxState.zoom + 10 });
    }
  };
  
  const handleZoomOut = () => {
    if (sandboxState.zoom > 50) {
      updateState({ zoom: sandboxState.zoom - 10 });
    }
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          title="Back to Settings"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateState({ showGrid: !sandboxState.showGrid })}
          className={sandboxState.showGrid ? "bg-muted" : ""}
          title="Toggle Grid"
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateState({ snapToGrid: !sandboxState.snapToGrid })}
          className={sandboxState.snapToGrid ? "bg-muted" : ""}
          title="Toggle Snap to Grid"
        >
          <MoveHorizontal className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center mx-1 px-2 border rounded-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={sandboxState.zoom <= 50}
            className="h-8 w-8 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm w-12 text-center">
            {sandboxState.zoom}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={sandboxState.zoom >= 200}
            className="h-8 w-8 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateState({ previewMode: !sandboxState.previewMode })}
          className={sandboxState.previewMode ? "bg-muted" : ""}
          title={sandboxState.previewMode ? "Exit Preview" : "Preview"}
        >
          {sandboxState.previewMode ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <div>
        <Button 
          variant={hasUnsavedChanges ? "default" : "outline"}
          size="sm"
          onClick={onSave}
        >
          <Save className="h-4 w-4 mr-1" />
          {hasUnsavedChanges ? "Save*" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default SandboxToolbar;
