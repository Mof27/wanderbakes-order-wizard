import { SettingItem, ColorSettingItem, SettingsData, ShapeSettingItem, PrintTemplate, DeliveryLabelTemplate, DriverSettings } from "@/types";
import { SettingsRepository } from "../settings.repository";
import { SupabaseBaseRepository } from "./base.repository";
import { baseColors } from "@/data/colorData";
import { cakeFlavors, cakeSizes, cakeShapes } from "@/data/mockData";

/**
 * Settings repository implementation for Supabase
 */
export class SupabaseSettingsRepository extends SupabaseBaseRepository implements SettingsRepository {
  private cachedSettings: SettingsData | null = null;
  private defaultSettings: SettingsData;

  constructor() {
    super('settings'); // Use the settings table we created
    console.log("Initializing SupabaseSettingsRepository...");
    this.defaultSettings = this.createDefaultSettings();
  }
  
  /**
   * Creates default settings for initial setup
   */
  private createDefaultSettings(): SettingsData {
    console.log("Creating default settings...");
    
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
    
    return initialSettings;
  }

  /**
   * Creates default print template
   */
  private createDefaultPrintTemplate(): PrintTemplate {
    // Default print template implementation
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

  /**
   * Creates default delivery label template
   */
  private createDefaultDeliveryLabelTemplate(): DeliveryLabelTemplate {
    // Default delivery label template implementation
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

  /**
   * Get all settings
   */
  async getAll(): Promise<SettingsData> {
    try {
      console.log("Getting all settings from Supabase...");
      
      // If we have cached settings, return them
      if (this.cachedSettings) {
        return this.cachedSettings;
      }

      const supabase = this.getClient();
      
      // Retrieve all settings from Supabase
      const { data: settingsData, error } = await supabase
        .from('settings')
        .select('*');
        
      if (error) {
        console.error('Error fetching settings from Supabase:', error);
        throw error;
      }

      // If no settings exist yet, create and store default settings
      if (!settingsData || settingsData.length === 0) {
        console.log("No settings found in Supabase, creating defaults...");
        await this.initializeDefaultSettings();
        return this.defaultSettings;
      }

      // Convert from Supabase format to app format
      const settings: SettingsData = {
        cakeSizes: [],
        cakeShapes: [],
        cakeFlavors: [],
        colors: [],
        printTemplate: this.createDefaultPrintTemplate(), // Fallback
        deliveryLabelTemplate: this.createDefaultDeliveryLabelTemplate(), // Fallback
        driverSettings: {
          driver1Name: "Driver 1",
          driver2Name: "Driver 2",
          driver1Vehicle: "Car",
          driver2Vehicle: "Car"
        }
      };

      // Process each setting by key
      for (const setting of settingsData) {
        switch (setting.key) {
          case 'cakeSizes':
            settings.cakeSizes = this.parseJsonWithDates(setting.value);
            break;
          case 'cakeShapes':
            settings.cakeShapes = this.parseJsonWithDates(setting.value);
            break;
          case 'cakeFlavors':
            settings.cakeFlavors = this.parseJsonWithDates(setting.value);
            break;
          case 'colors':
            settings.colors = this.parseJsonWithDates(setting.value);
            break;
          case 'printTemplate':
            settings.printTemplate = setting.value;
            break;
          case 'deliveryLabelTemplate':
            settings.deliveryLabelTemplate = setting.value;
            break;
          case 'driverSettings':
            settings.driverSettings = setting.value;
            break;
        }
      }

      // Cache the fetched settings
      this.cachedSettings = settings;
      return settings;
      
    } catch (error) {
      console.error("Error in getAll settings:", error);
      // Fall back to default settings if there's an error
      return this.defaultSettings;
    }
  }

  /**
   * Parse JSON with proper date handling
   */
  private parseJsonWithDates(jsonValue: any): any {
    // Handle date properties in JSON
    if (Array.isArray(jsonValue)) {
      return jsonValue.map(item => {
        if (item.createdAt) {
          item.createdAt = new Date(item.createdAt);
        }
        if (item.updatedAt) {
          item.updatedAt = new Date(item.updatedAt);
        }
        return item;
      });
    }
    return jsonValue;
  }

  /**
   * Initialize default settings in Supabase
   */
  private async initializeDefaultSettings(): Promise<void> {
    try {
      const supabase = this.getClient();
      const defaultSettings = this.defaultSettings;
      
      // Create settings entries for each settings type
      await supabase.from('settings').insert([
        { key: 'cakeSizes', value: defaultSettings.cakeSizes },
        { key: 'cakeShapes', value: defaultSettings.cakeShapes },
        { key: 'cakeFlavors', value: defaultSettings.cakeFlavors },
        { key: 'colors', value: defaultSettings.colors },
        { key: 'printTemplate', value: defaultSettings.printTemplate },
        { key: 'deliveryLabelTemplate', value: defaultSettings.deliveryLabelTemplate },
        { key: 'driverSettings', value: defaultSettings.driverSettings }
      ]);
      
      console.log("Default settings initialized in Supabase.");
      
    } catch (error) {
      console.error("Error initializing default settings:", error);
      throw error;
    }
  }

  /**
   * Update cake sizes
   */
  async updateCakeSizes(items: SettingItem[]): Promise<SettingItem[]> {
    try {
      const supabase = this.getClient();
      
      // Update the cake sizes setting in Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'cakeSizes', 
          value: items,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        
      if (error) {
        console.error('Error updating cake sizes in Supabase:', error);
        throw error;
      }
      
      // Update cached settings
      if (this.cachedSettings) {
        this.cachedSettings.cakeSizes = items;
      }
      
      return items;
      
    } catch (error) {
      console.error("Error in updateCakeSizes:", error);
      throw error;
    }
  }

  /**
   * Update cake shapes
   */
  async updateCakeShapes(items: ShapeSettingItem[]): Promise<ShapeSettingItem[]> {
    try {
      const supabase = this.getClient();
      
      // Update the cake shapes setting in Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'cakeShapes', 
          value: items,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        
      if (error) {
        console.error('Error updating cake shapes in Supabase:', error);
        throw error;
      }
      
      // Update cached settings
      if (this.cachedSettings) {
        this.cachedSettings.cakeShapes = items;
      }
      
      return items;
      
    } catch (error) {
      console.error("Error in updateCakeShapes:", error);
      throw error;
    }
  }

  /**
   * Update cake flavors
   */
  async updateCakeFlavors(items: SettingItem[]): Promise<SettingItem[]> {
    try {
      const supabase = this.getClient();
      
      // Update the cake flavors setting in Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'cakeFlavors', 
          value: items,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        
      if (error) {
        console.error('Error updating cake flavors in Supabase:', error);
        throw error;
      }
      
      // Update cached settings
      if (this.cachedSettings) {
        this.cachedSettings.cakeFlavors = items;
      }
      
      return items;
      
    } catch (error) {
      console.error("Error in updateCakeFlavors:", error);
      throw error;
    }
  }

  /**
   * Update colors
   */
  async updateColors(items: ColorSettingItem[]): Promise<ColorSettingItem[]> {
    try {
      const supabase = this.getClient();
      
      // Update the colors setting in Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'colors', 
          value: items,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        
      if (error) {
        console.error('Error updating colors in Supabase:', error);
        throw error;
      }
      
      // Update cached settings
      if (this.cachedSettings) {
        this.cachedSettings.colors = items;
      }
      
      return items;
      
    } catch (error) {
      console.error("Error in updateColors:", error);
      throw error;
    }
  }

  /**
   * Update print template
   */
  async updatePrintTemplate(template: PrintTemplate): Promise<PrintTemplate> {
    try {
      const supabase = this.getClient();
      
      // Update the print template setting in Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'printTemplate', 
          value: template,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        
      if (error) {
        console.error('Error updating print template in Supabase:', error);
        throw error;
      }
      
      // Update cached settings
      if (this.cachedSettings) {
        this.cachedSettings.printTemplate = template;
      }
      
      return template;
      
    } catch (error) {
      console.error("Error in updatePrintTemplate:", error);
      throw error;
    }
  }

  /**
   * Update delivery label template
   */
  async updateDeliveryLabelTemplate(template: DeliveryLabelTemplate): Promise<DeliveryLabelTemplate> {
    try {
      const supabase = this.getClient();
      
      // Update the delivery label template setting in Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'deliveryLabelTemplate', 
          value: template,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        
      if (error) {
        console.error('Error updating delivery label template in Supabase:', error);
        throw error;
      }
      
      // Update cached settings
      if (this.cachedSettings) {
        this.cachedSettings.deliveryLabelTemplate = template;
      }
      
      return template;
      
    } catch (error) {
      console.error("Error in updateDeliveryLabelTemplate:", error);
      throw error;
    }
  }

  /**
   * Update driver settings
   */
  async updateDriverSettings(settings: DriverSettings): Promise<DriverSettings> {
    try {
      const supabase = this.getClient();
      
      // Update the driver settings in Supabase
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          key: 'driverSettings', 
          value: settings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        
      if (error) {
        console.error('Error updating driver settings in Supabase:', error);
        throw error;
      }
      
      // Update cached settings
      if (this.cachedSettings) {
        this.cachedSettings.driverSettings = settings;
      }
      
      return settings;
      
    } catch (error) {
      console.error("Error in updateDriverSettings:", error);
      throw error;
    }
  }

  /**
   * Clear settings cache
   */
  clearCache(): void {
    this.cachedSettings = null;
  }
}
