
import { SettingItem, ColorSettingItem, SettingsData, ShapeSettingItem, PrintTemplate } from "@/types";
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
  updatePrintTemplate(template: PrintTemplate): Promise<PrintTemplate>;
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
      })),
      printTemplate: this.createDefaultPrintTemplate()
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

  private createDefaultPrintTemplate(): PrintTemplate {
    return {
      title: "Cake Order Form",
      orientation: "portrait",
      sections: [
        {
          id: "header",
          title: "Header",
          enabled: true,
          order: 0,
          fields: [
            {
              id: "form_title",
              type: "text",
              label: "Title",
              value: "Cake Order Form",
              enabled: true,
              order: 0
            },
            {
              id: "order_id",
              type: "field",
              label: "Order #",
              fieldKey: "id",
              enabled: true,
              order: 1
            }
          ]
        },
        {
          id: "customer_details",
          title: "Customer Details",
          enabled: true,
          order: 1,
          fields: [
            {
              id: "customer_name",
              type: "field",
              label: "Name",
              fieldKey: "customer.name",
              enabled: true,
              order: 0
            },
            {
              id: "customer_whatsapp",
              type: "field",
              label: "WhatsApp",
              fieldKey: "customer.whatsappNumber",
              enabled: true,
              order: 1
            },
            {
              id: "customer_email",
              type: "field",
              label: "Email",
              fieldKey: "customer.email",
              enabled: true,
              order: 2
            }
          ]
        },
        {
          id: "order_info",
          title: "Order Information",
          enabled: true,
          order: 2,
          fields: [
            {
              id: "order_date",
              type: "field",
              label: "Order Date",
              fieldKey: "orderDate",
              enabled: true,
              order: 0
            },
            {
              id: "delivery_date",
              type: "field",
              label: "Delivery Date",
              fieldKey: "deliveryDate",
              enabled: true,
              order: 1
            },
            {
              id: "delivery_time",
              type: "field",
              label: "Delivery Time",
              fieldKey: "deliveryTimeSlot",
              enabled: true,
              order: 2
            }
          ]
        },
        {
          id: "cake_details",
          title: "Cake Details",
          enabled: true,
          order: 3,
          fields: [
            {
              id: "cake_flavor",
              type: "field",
              label: "Cake Flavor",
              fieldKey: "cakeFlavor",
              enabled: true,
              order: 0
            },
            {
              id: "cake_size",
              type: "field",
              label: "Cake Size",
              fieldKey: "cakeSize",
              enabled: true,
              order: 1
            },
            {
              id: "cake_shape",
              type: "field",
              label: "Cake Shape",
              fieldKey: "cakeShape",
              enabled: true,
              order: 2
            },
            {
              id: "cake_tier",
              type: "field",
              label: "Number of Tiers",
              fieldKey: "cakeTier",
              enabled: true,
              order: 3
            },
            {
              id: "cover_type",
              type: "field",
              label: "Cover Type",
              fieldKey: "coverType",
              enabled: true,
              order: 4
            },
            {
              id: "cover_color",
              type: "field",
              label: "Cover Color",
              fieldKey: "coverColor",
              enabled: true,
              order: 5
            },
            {
              id: "cake_design",
              type: "field",
              label: "Cake Design",
              fieldKey: "cakeDesign",
              enabled: true,
              order: 6
            },
            {
              id: "cake_text",
              type: "field",
              label: "Cake Text",
              fieldKey: "cakeText",
              enabled: true,
              order: 7
            }
          ]
        },
        {
          id: "delivery_details",
          title: "Delivery Details",
          enabled: true,
          order: 4,
          fields: [
            {
              id: "delivery_method",
              type: "field",
              label: "Delivery Method",
              fieldKey: "deliveryMethod",
              enabled: true,
              order: 0
            },
            {
              id: "delivery_address",
              type: "field",
              label: "Address",
              fieldKey: "deliveryAddress",
              enabled: true,
              order: 1
            },
            {
              id: "delivery_area",
              type: "field",
              label: "Area",
              fieldKey: "deliveryArea",
              enabled: true,
              order: 2
            },
            {
              id: "delivery_notes",
              type: "field",
              label: "Delivery Notes",
              fieldKey: "deliveryAddressNotes",
              enabled: true,
              order: 3
            }
          ]
        },
        {
          id: "pricing",
          title: "Pricing",
          enabled: true,
          order: 5,
          fields: [
            {
              id: "cake_price",
              type: "field",
              label: "Cake Price",
              fieldKey: "cakePrice",
              enabled: true,
              order: 0
            },
            {
              id: "delivery_price",
              type: "field",
              label: "Delivery Price",
              fieldKey: "deliveryPrice",
              enabled: true,
              order: 1
            },
            {
              id: "total_price",
              type: "field",
              label: "Total Price",
              fieldKey: "totalPrice",
              enabled: true,
              order: 2
            }
          ]
        },
        {
          id: "notes",
          title: "Additional Notes",
          enabled: true,
          order: 6,
          fields: [
            {
              id: "notes",
              type: "field",
              label: "Notes",
              fieldKey: "notes",
              enabled: true,
              order: 0
            }
          ]
        },
        {
          id: "packing_items",
          title: "Packing Items",
          enabled: true,
          order: 7,
          fields: [
            {
              id: "packing_items_list",
              type: "field",
              label: "Items",
              fieldKey: "packingItems",
              enabled: true,
              order: 0
            }
          ]
        },
        {
          id: "footer",
          title: "Footer",
          enabled: true,
          order: 8,
          fields: [
            {
              id: "print_date",
              type: "field",
              label: "Printed on",
              fieldKey: "printDate",
              enabled: true,
              order: 0
            }
          ]
        }
      ]
    };
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

  async updatePrintTemplate(template: PrintTemplate): Promise<PrintTemplate> {
    this.settings.printTemplate = template;
    this.saveSettings();
    return template;
  }
}
