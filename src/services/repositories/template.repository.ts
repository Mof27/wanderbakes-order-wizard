
import { TemplateVersion, SandboxTemplateType } from "@/types/template";
import { PrintTemplate, DeliveryLabelTemplate } from "@/types";

/**
 * Template repository interface
 */
export interface TemplateRepository {
  // Get all template versions
  getTemplateVersions(templateType: SandboxTemplateType): Promise<TemplateVersion[]>;
  
  // Get active template
  getActiveTemplate(templateType: SandboxTemplateType): Promise<TemplateVersion | null>;
  
  // Create new template version
  createTemplateVersion(version: Omit<TemplateVersion, 'id' | 'createdAt'>): Promise<TemplateVersion>;
  
  // Update template version
  updateTemplateVersion(version: TemplateVersion): Promise<TemplateVersion>;
  
  // Delete template version
  deleteTemplateVersion(versionId: string): Promise<boolean>;
  
  // Set active template version
  setActiveTemplate(versionId: string, templateType: SandboxTemplateType): Promise<boolean>;
}

/**
 * Mock implementation of template repository
 */
export class MockTemplateRepository implements TemplateRepository {
  private templateVersions: TemplateVersion[] = [];
  
  constructor() {
    // Initialize with data from localStorage or with defaults
    console.log("Initializing MockTemplateRepository...");
    this.loadTemplateVersions();
  }
  
  private loadTemplateVersions() {
    // Try to load from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedVersions = localStorage.getItem('cakeShopTemplateVersions');
        if (savedVersions) {
          this.templateVersions = JSON.parse(savedVersions, (key, value) => {
            // Convert date strings back to Date objects
            if (key === 'createdAt') {
              return new Date(value);
            }
            return value;
          });
          console.log("Loaded template versions from localStorage:", this.templateVersions);
          return;
        }
      } catch (error) {
        console.error('Failed to load template versions from localStorage', error);
      }
    }
    
    // If no saved versions, initialize empty array
    this.templateVersions = [];
    console.log("No template versions found, using empty array");
  }
  
  private saveTemplateVersions() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cakeShopTemplateVersions', JSON.stringify(this.templateVersions));
      } catch (error) {
        console.error('Failed to save template versions to localStorage', error);
      }
    }
  }
  
  async getTemplateVersions(templateType: SandboxTemplateType): Promise<TemplateVersion[]> {
    return this.templateVersions
      .filter(version => version.templateType === templateType)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getActiveTemplate(templateType: SandboxTemplateType): Promise<TemplateVersion | null> {
    const activeVersion = this.templateVersions.find(
      version => version.templateType === templateType && version.isActive
    );
    return activeVersion || null;
  }
  
  async createTemplateVersion(version: Omit<TemplateVersion, 'id' | 'createdAt'>): Promise<TemplateVersion> {
    // If setting this as active, deactivate others of the same type
    if (version.isActive) {
      this.templateVersions = this.templateVersions.map(v => 
        v.templateType === version.templateType ? { ...v, isActive: false } : v
      );
    }
    
    const newVersion: TemplateVersion = {
      ...version,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    
    this.templateVersions.push(newVersion);
    this.saveTemplateVersions();
    
    return newVersion;
  }
  
  async updateTemplateVersion(version: TemplateVersion): Promise<TemplateVersion> {
    // If setting this as active, deactivate others of the same type
    if (version.isActive) {
      this.templateVersions = this.templateVersions.map(v => 
        v.templateType === version.templateType && v.id !== version.id ? 
        { ...v, isActive: false } : v
      );
    }
    
    this.templateVersions = this.templateVersions.map(v => 
      v.id === version.id ? version : v
    );
    
    this.saveTemplateVersions();
    return version;
  }
  
  async deleteTemplateVersion(versionId: string): Promise<boolean> {
    const initialLength = this.templateVersions.length;
    this.templateVersions = this.templateVersions.filter(v => v.id !== versionId);
    
    if (this.templateVersions.length !== initialLength) {
      this.saveTemplateVersions();
      return true;
    }
    
    return false;
  }
  
  async setActiveTemplate(versionId: string, templateType: SandboxTemplateType): Promise<boolean> {
    let found = false;
    
    this.templateVersions = this.templateVersions.map(v => {
      if (v.templateType === templateType) {
        if (v.id === versionId) {
          found = true;
          return { ...v, isActive: true };
        } else {
          return { ...v, isActive: false };
        }
      }
      return v;
    });
    
    if (found) {
      this.saveTemplateVersions();
    }
    
    return found;
  }
}
