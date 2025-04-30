
import { SettingItem, ColorSettingItem, SettingsData, ShapeSettingItem } from "@/types";
import { baseColors } from "@/data/colorData";
import { cakeFlavors, cakeSizes, cakeShapes } from "@/data/mockData";

/**
 * Settings repository interface
 */
export interface SettingsRepository {
  getAll(): Promise<SettingsData>;
  updateCakeSizes(items: SettingItem[]): Promise<SettingItem[]>;
  updateCakeShapes(items: ShapeSettingItem[]): Promise<ShapeSettingItem[]>;
  updateCakeFlavors(items: SettingItem[]): Promise<SettingItem[]>;
  updateColors(items: ColorSettingItem[]): Promise<ColorSettingItem[]>;
}

/**
 * Mock implementation of settings repository
 */
export class MockSettingsRepository implements SettingsRepository {
  private settings: SettingsData;
  
  constructor() {
    // Initialize with data from the mock data files
    this.settings = this.loadInitialSettings();
  }
  
  private loadInitialSettings(): SettingsData {
    // Convert from existing data format to settings format
    const initialSettings: SettingsData = {
      cakeSizes: cakeSizes.map(size => ({
        id: `size_${size.replace(/\s+/g, '_').toLowerCase()}`,
        name: size,
        value: size,
        enabled: true,
        createdAt: new Date()
      })),
      cakeShapes: cakeShapes.map(shape => ({
        id: `shape_${shape.replace(/\s+/g, '_').toLowerCase()}`,
        name: shape,
        value: shape,
        enabled: true,
        customFields: shape === 'Custom',
        createdAt: new Date()
      })),
      cakeFlavors: cakeFlavors.map(flavor => ({
        id: `flavor_${flavor.replace(/\s+/g, '_').toLowerCase()}`,
        name: flavor,
        value: flavor,
        enabled: true,
        createdAt: new Date()
      })),
      colors: baseColors.map(color => ({
        id: `color_${color.name.replace(/\s+/g, '_').toLowerCase()}`,
        name: color.name,
        value: color.value,
        enabled: true,
        createdAt: new Date()
      }))
    };
    
    // Try to load from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('cakeShopSettings');
        if (savedSettings) {
          return JSON.parse(savedSettings, (key, value) => {
            // Convert date strings back to Date objects
            if (key === 'createdAt' || key === 'updatedAt') {
              return new Date(value);
            }
            return value;
          });
        }
      } catch (error) {
        console.error('Failed to load settings from localStorage', error);
      }
    }
    
    return initialSettings;
  }
  
  private saveSettings() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cakeShopSettings', JSON.stringify(this.settings));
      } catch (error) {
        console.error('Failed to save settings to localStorage', error);
      }
    }
  }
  
  async getAll(): Promise<SettingsData> {
    return this.settings;
  }
  
  async updateCakeSizes(items: SettingItem[]): Promise<SettingItem[]> {
    this.settings.cakeSizes = items;
    this.saveSettings();
    return items;
  }
  
  async updateCakeShapes(items: ShapeSettingItem[]): Promise<ShapeSettingItem[]> {
    this.settings.cakeShapes = items;
    this.saveSettings();
    return items;
  }
  
  async updateCakeFlavors(items: SettingItem[]): Promise<SettingItem[]> {
    this.settings.cakeFlavors = items;
    this.saveSettings();
    return items;
  }
  
  async updateColors(items: ColorSettingItem[]): Promise<ColorSettingItem[]> {
    this.settings.colors = items;
    this.saveSettings();
    return items;
  }
}
