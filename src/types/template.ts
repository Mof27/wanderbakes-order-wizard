
import { PrintTemplate, DeliveryLabelTemplate, TextAlignment, FontWeight, FontStyle, FontSize } from "./index";

// Type to represent both template types in the sandbox
export type SandboxTemplateType = 'order-form' | 'delivery-label';

// Template element position and size
export interface TemplateElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Template version for saving and restoring templates
export interface TemplateVersion {
  id: string;
  name: string;
  description?: string;
  templateType: SandboxTemplateType;
  templateData: PrintTemplate | DeliveryLabelTemplate;
  isActive: boolean;
  createdAt: Date;
}

// Sandbox state for managing the editor
export interface SandboxState {
  selectedElementId: string | null;
  selectedSectionId: string | null;
  showGrid: boolean;
  zoom: number;
  previewMode: boolean;
  snapToGrid: boolean;
}

// Element library categories
export type ElementCategory = 'text' | 'fields' | 'layout' | 'special';

// Element library item - represents a draggable element type
export interface ElementLibraryItem {
  id: string;
  name: string;
  icon: string;
  category: ElementCategory;
  type: string;
  defaultProps: {
    label?: string;
    value?: string;
    fieldKey?: string;
    fontSize?: FontSize;
    fontWeight?: FontWeight;
    fontStyle?: FontStyle;
    alignment?: TextAlignment;
    size?: number;
    height?: number;
  };
}
