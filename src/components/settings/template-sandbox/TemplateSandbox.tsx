import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dataService } from "@/services";
import { SandboxTemplateType, SandboxState, TemplateVersion } from "@/types/template";
import { PrintTemplate, DeliveryLabelTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { Undo2, Redo2, Save, Copy, Eye, Download, Upload, ArrowLeft } from "lucide-react";

import SandboxToolbar from "./SandboxToolbar";
import ElementLibrary from "./ElementLibrary";
import PropertiesPanel from "./PropertiesPanel";
import CanvasWorkspace from "./CanvasWorkspace";
import VersionsPanel from "./VersionsPanel";

const TemplateSandbox = () => {
  const { templateType = "order-form" } = useParams<{ templateType: SandboxTemplateType }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Initialize sandbox state
  const [sandboxState, setSandboxState] = useState<SandboxState>({
    selectedElementId: null,
    selectedSectionId: null,
    showGrid: true,
    zoom: 100,
    previewMode: false,
    snapToGrid: true
  });
  
  // Template state
  const [currentTemplate, setCurrentTemplate] = useState<PrintTemplate | DeliveryLabelTemplate | null>(null);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // History management
  const [history, setHistory] = useState<(PrintTemplate | DeliveryLabelTemplate)[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Load active template version
  const { data: activeVersion, isLoading: isLoadingActive } = useQuery({
    queryKey: ['templateVersions', templateType, 'active'],
    queryFn: () => dataService.templates.getActiveTemplate(templateType as SandboxTemplateType)
  });
  
  // Load all template versions
  const { data: allVersions, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['templateVersions', templateType],
    queryFn: () => dataService.templates.getTemplateVersions(templateType as SandboxTemplateType)
  });
  
  // Create new version mutation
  const createVersion = useMutation({
    mutationFn: (version: Omit<TemplateVersion, 'id' | 'createdAt'>) => 
      dataService.templates.createTemplateVersion(version),
    onSuccess: (newVersion) => {
      queryClient.invalidateQueries({ queryKey: ['templateVersions', templateType] });
      toast.success('Template saved successfully!');
      setCurrentVersionId(newVersion.id);
      setUnsavedChanges(false);
    }
  });
  
  // Update version mutation
  const updateVersion = useMutation({
    mutationFn: (version: TemplateVersion) => 
      dataService.templates.updateTemplateVersion(version),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templateVersions', templateType] });
      toast.success('Template updated successfully!');
      setUnsavedChanges(false);
    }
  });
  
  // Set active version mutation
  const setActiveVersion = useMutation({
    mutationFn: (versionId: string) => 
      dataService.templates.setActiveTemplate(versionId, templateType as SandboxTemplateType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templateVersions', templateType] });
      queryClient.invalidateQueries({ queryKey: ['templateVersions', templateType, 'active'] });
      toast.success('Active template updated!');
    }
  });
  
  // Load initial template data
  useEffect(() => {
    if (activeVersion && !currentTemplate) {
      setCurrentTemplate(activeVersion.templateData);
      setCurrentVersionId(activeVersion.id);
      
      // Initialize history
      setHistory([activeVersion.templateData]);
      setHistoryIndex(0);
    }
  }, [activeVersion, currentTemplate]);
  
  // Handle template changes
  const handleTemplateChange = (updatedTemplate: PrintTemplate | DeliveryLabelTemplate) => {
    setCurrentTemplate(updatedTemplate);
    setUnsavedChanges(true);
    
    // Add to history
    const newHistory = [...history.slice(0, historyIndex + 1), updatedTemplate];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentTemplate(history[newIndex]);
      setUnsavedChanges(true);
    }
  };
  
  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentTemplate(history[newIndex]);
      setUnsavedChanges(true);
    }
  };
  
  // Save current template
  const handleSave = () => {
    if (!currentTemplate) return;
    
    if (currentVersionId) {
      // Update existing version
      const versionToUpdate = allVersions?.find(v => v.id === currentVersionId);
      if (versionToUpdate) {
        updateVersion.mutate({
          ...versionToUpdate,
          templateData: currentTemplate
        });
      }
    } else {
      // Create new version
      createVersion.mutate({
        name: `${templateType} Template - ${new Date().toLocaleDateString()}`,
        templateType: templateType as SandboxTemplateType,
        templateData: currentTemplate,
        isActive: false
      });
    }
  };
  
  // Save as new version
  const handleSaveAs = (name: string, makeActive: boolean) => {
    if (!currentTemplate) return;
    
    createVersion.mutate({
      name,
      templateType: templateType as SandboxTemplateType,
      templateData: currentTemplate,
      isActive: makeActive
    });
  };
  
  // Set active version
  const handleSetActive = (versionId: string) => {
    if (unsavedChanges) {
      // Ask user to save first
      if (confirm('You have unsaved changes. Save before switching versions?')) {
        handleSave();
      }
    }
    
    setActiveVersion.mutate(versionId);
  };
  
  // Load a specific version
  const handleLoadVersion = (version: TemplateVersion) => {
    if (unsavedChanges) {
      // Ask user to save first
      if (confirm('You have unsaved changes. Save before loading a different version?')) {
        handleSave();
      }
    }
    
    setCurrentTemplate(version.templateData);
    setCurrentVersionId(version.id);
    
    // Reset history
    setHistory([version.templateData]);
    setHistoryIndex(0);
    setUnsavedChanges(false);
  };
  
  // Toggle preview mode
  const togglePreviewMode = () => {
    setSandboxState({
      ...sandboxState,
      previewMode: !sandboxState.previewMode
    });
  };
  
  // Handle back button
  const handleBackToSettings = () => {
    if (unsavedChanges) {
      if (confirm('You have unsaved changes. Save before leaving?')) {
        handleSave();
      }
    }
    navigate('/settings/printing-templates');
  };
  
  if (isLoadingActive || isLoadingVersions) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading template sandbox...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <Helmet>
        <title>
          {`${templateType === 'order-form' ? 'Order Form' : 'Delivery Label'} Template Editor | Cake Shop`}
        </title>
      </Helmet>
      
      {/* Header and top toolbar */}
      <div className="border-b bg-background p-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBackToSettings}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">
              {templateType === 'order-form' ? 'Order Form Template Editor' : 'Delivery Label Template Editor'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant={sandboxState.previewMode ? "secondary" : "ghost"}
              size="sm"
              onClick={togglePreviewMode}
            >
              <Eye className="h-4 w-4 mr-1" />
              {sandboxState.previewMode ? 'Editing' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const name = prompt('Enter a name for this version:');
                if (name) {
                  handleSaveAs(name, false);
                }
              }}
            >
              <Copy className="h-4 w-4 mr-1" />
              Save As
            </Button>
            <Button
              variant={unsavedChanges ? "default" : "outline"}
              size="sm"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" />
              {unsavedChanges ? 'Save*' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Element library */}
        <div className="w-64 border-r bg-muted/20 overflow-y-auto flex flex-col">
          <ElementLibrary 
            templateType={templateType as SandboxTemplateType}
            onAddElement={(element) => {
              // Logic to add element to the canvas
              console.log('Add element', element);
            }}
          />
        </div>
        
        {/* Center - Canvas workspace */}
        <div className="flex-1 overflow-auto">
          <CanvasWorkspace 
            template={currentTemplate}
            sandboxState={sandboxState}
            templateType={templateType as SandboxTemplateType}
            onTemplateChange={handleTemplateChange}
            onElementSelect={(elementId) => {
              setSandboxState({
                ...sandboxState,
                selectedElementId: elementId,
                selectedSectionId: null
              });
            }}
            onSectionSelect={(sectionId) => {
              setSandboxState({
                ...sandboxState,
                selectedSectionId: sectionId,
                selectedElementId: null
              });
            }}
          />
        </div>
        
        {/* Right panel - Properties and version history */}
        <div className="w-72 border-l bg-muted/20 overflow-y-auto flex flex-col">
          {/* Properties panel */}
          <PropertiesPanel 
            sandboxState={sandboxState}
            template={currentTemplate}
            onTemplateChange={handleTemplateChange}
            onSandboxStateChange={setSandboxState}
          />
          
          {/* Version history panel */}
          <div className="border-t p-4">
            <VersionsPanel 
              versions={allVersions || []}
              currentVersionId={currentVersionId}
              onLoadVersion={handleLoadVersion}
              onSetActive={handleSetActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSandbox;
