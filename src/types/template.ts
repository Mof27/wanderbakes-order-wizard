
import { PrintTemplate, DeliveryLabelTemplate } from "./index";

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
  defaultProps: Record<string, any>;
}

// Text alignment options
export type TextAlignment = 'left' | 'center' | 'right';

// Font weight options
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';

// Font style options
export type FontStyle = 'normal' | 'italic';

// Font size options
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
