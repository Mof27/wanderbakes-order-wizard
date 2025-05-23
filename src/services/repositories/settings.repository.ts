import { SettingItem, ColorSettingItem, SettingsData, ShapeSettingItem, PrintTemplate, DeliveryLabelTemplate, DriverSettings } from "@/types";
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
  updateDeliveryLabelTemplate(template: DeliveryLabelTemplate): Promise<DeliveryLabelTemplate>;
  updateDriverSettings(settings: DriverSettings): Promise<DriverSettings>;
}

/**
 * Mock implementation of settings repository
 */
export class MockSettingsRepository implements SettingsRepository {
  private settings: SettingsData;
  
  constructor() {
    // Initialize with data from the mock data files
    console.log("Initializing MockSettingsRepository...");
    this.settings = this.loadInitialSettings();
    console.log("Settings initialized:", this.settings);
  }
  
  private loadInitialSettings(): SettingsData {
    console.log("Loading initial settings...");
    
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
      printTemplate: this.createDefaultPrintTemplate(),
      deliveryLabelTemplate: this.createDefaultDeliveryLabelTemplate(),
      driverSettings: {
        driver1Name: "Driver 1",
        driver2Name: "Driver 2",
        driver1Vehicle: "Car",
        driver2Vehicle: "Car"
      }
    };
    
    // Try to load from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem('cakeShopSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings, (key, value) => {
            // Convert date strings back to Date objects
            if (key === 'createdAt' || key === 'updatedAt') {
              return new Date(value);
            }
            return value;
          });
          console.log("Loaded settings from localStorage:", parsedSettings);
          
          // If delivery label template is not in saved settings, add it
          if (!parsedSettings.deliveryLabelTemplate) {
            parsedSettings.deliveryLabelTemplate = this.createDefaultDeliveryLabelTemplate();
          }
          
          // If driver settings are not in saved settings or missing vehicle info, add default values
          if (!parsedSettings.driverSettings) {
            parsedSettings.driverSettings = {
              driver1Name: "Driver 1",
              driver2Name: "Driver 2",
              driver1Vehicle: "Car",
              driver2Vehicle: "Car"
            };
          } else {
            // Ensure vehicle properties are set (for backwards compatibility)
            if (!parsedSettings.driverSettings.driver1Vehicle) {
              parsedSettings.driverSettings.driver1Vehicle = "Car";
            }
            if (!parsedSettings.driverSettings.driver2Vehicle) {
              parsedSettings.driverSettings.driver2Vehicle = "Car";
            }
          }
          
          return parsedSettings;
        }
      } catch (error) {
        console.error('Failed to load settings from localStorage', error);
      }
    }
    
    console.log("Using default settings");
    return initialSettings;
  }

  private createDefaultPrintTemplate(): PrintTemplate {
    return {
      title: "Cake Order Form",
      orientation: "landscape",
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
            },
            {
              id: "order_qr",
              type: "qr-code",
              label: "Order QR Code",
              fieldKey: "orderUrl",
              size: 100,
              enabled: true,
              order: 2
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

  private createDefaultDeliveryLabelTemplate(): DeliveryLabelTemplate {
    return {
      title: "Delivery Label",
      sections: [
        {
          id: "recipient_section",
          title: "Recipient",
          enabled: true,
          order: 0,
          fields: [
            {
              id: "recipient_name",
              type: "field",
              label: "Name",
              fieldKey: "customer.name",
              enabled: true,
              order: 0,
              fontSize: "lg",
              fontWeight: "bold"
            },
            {
              id: "recipient_phone",
              type: "field",
              label: "Phone",
              fieldKey: "customer.whatsappNumber",
              enabled: true,
              order: 1
            },
            {
              id: "recipient_address",
              type: "field",
              label: "Address",
              fieldKey: "deliveryAddress",
              enabled: true,
              order: 2
            },
            {
              id: "recipient_area",
              type: "field",
              label: "Area",
              fieldKey: "deliveryArea",
              enabled: true,
              order: 3
            },
            {
              id: "recipient_notes",
              type: "field",
              label: "Notes",
              fieldKey: "deliveryAddressNotes",
              enabled: true,
              order: 4
            }
          ]
        },
        {
          id: "delivery_section",
          title: "Delivery Information",
          enabled: true,
          order: 1,
          fields: [
            {
              id: "delivery_date",
              type: "field",
              label: "Date",
              fieldKey: "deliveryDate",
              enabled: true,
              order: 0
            },
            {
              id: "delivery_time",
              type: "field",
              label: "Time",
              fieldKey: "deliveryTimeSlot",
              enabled: true,
              order: 1
            },
            {
              id: "delivery_method",
              type: "field",
              label: "Method",
              fieldKey: "deliveryMethod",
              enabled: true,
              order: 2
            }
          ]
        },
        {
          id: "order_section",
          title: "Order Details",
          enabled: true,
          order: 2,
          fields: [
            {
              id: "order_id",
              type: "field",
              label: "Order ID",
              fieldKey: "id",
              enabled: true,
              order: 0
            },
            {
              id: "cake_info",
              type: "text",
              label: "Cake Info",
              value: "Cake information",
              enabled: true,
              order: 1
            },
            {
              id: "qr_code",
              type: "qr-code",
              label: "Scan for Order",
              fieldKey: "orderUrl",
              size: 120,
              enabled: true,
              order: 2
            },
            {
              id: "whatsapp_qr",
              type: "qr-code",
              label: "WhatsApp Contact",
              fieldKey: "customer.whatsappLink",
              size: 100,
              enabled: true,
              order: 3
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
    console.log("Getting all settings:", this.settings);
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

  async updateDeliveryLabelTemplate(template: DeliveryLabelTemplate): Promise<DeliveryLabelTemplate> {
    this.settings.deliveryLabelTemplate = template;
    this.saveSettings();
    return template;
  }

  async updateDriverSettings(settings: DriverSettings): Promise<DriverSettings> {
    this.settings.driverSettings = settings;
    this.saveSettings();
    return settings;
  }
}
