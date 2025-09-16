import { SettingItem, ColorSettingItem, SettingsData, ShapeSettingItem, PrintTemplate, DeliveryLabelTemplate, DriverSettings } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { SettingsRepository } from "../settings.repository";
import { baseColors } from "@/data/colorData";
import { cakeFlavors, cakeSizes, cakeShapes } from "@/data/mockData";

export class LiveSettingsRepository implements SettingsRepository {
  async getAll(): Promise<SettingsData> {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) throw error;

    // Create settings map
    const settingsMap = new Map<string, any>();
    settings?.forEach(setting => {
      settingsMap.set(setting.key, setting.value);
    });

    // Return structured settings with defaults if not found
    return {
      cakeSizes: settingsMap.get('cakeSizes') || this.getDefaultCakeSizes(),
      cakeShapes: settingsMap.get('cakeShapes') || this.getDefaultCakeShapes(),
      cakeFlavors: settingsMap.get('cakeFlavors') || this.getDefaultCakeFlavors(),
      colors: settingsMap.get('colors') || this.getDefaultColors(),
      printTemplate: settingsMap.get('printTemplate') || this.getDefaultPrintTemplate(),
      deliveryLabelTemplate: settingsMap.get('deliveryLabelTemplate') || this.getDefaultDeliveryLabelTemplate(),
      driverSettings: settingsMap.get('driverSettings') || this.getDefaultDriverSettings()
    };
  }

  async updateCakeSizes(items: SettingItem[]): Promise<SettingItem[]> {
    await this.updateSetting('cakeSizes', items);
    return items;
  }

  async updateCakeShapes(items: ShapeSettingItem[]): Promise<ShapeSettingItem[]> {
    await this.updateSetting('cakeShapes', items);
    return items;
  }

  async updateCakeFlavors(items: SettingItem[]): Promise<SettingItem[]> {
    await this.updateSetting('cakeFlavors', items);
    return items;
  }

  async updateColors(items: ColorSettingItem[]): Promise<ColorSettingItem[]> {
    await this.updateSetting('colors', items);
    return items;
  }

  async updatePrintTemplate(template: PrintTemplate): Promise<PrintTemplate> {
    await this.updateSetting('printTemplate', template);
    return template;
  }

  async updateDeliveryLabelTemplate(template: DeliveryLabelTemplate): Promise<DeliveryLabelTemplate> {
    await this.updateSetting('deliveryLabelTemplate', template);
    return template;
  }

  async updateDriverSettings(settings: DriverSettings): Promise<DriverSettings> {
    await this.updateSetting('driverSettings', settings);
    return settings;
  }

  private async updateSetting(key: string, value: any): Promise<void> {
    const { error } = await supabase
      .from('settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) throw error;
  }

  private getDefaultCakeSizes(): SettingItem[] {
    return cakeSizes.map(size => ({
      id: `size_${size.replace(/\s+/g, '_').toLowerCase()}`,
      name: size,
      value: size,
      enabled: true,
      createdAt: new Date()
    }));
  }

  private getDefaultCakeShapes(): ShapeSettingItem[] {
    return cakeShapes.map(shape => ({
      id: `shape_${shape.replace(/\s+/g, '_').toLowerCase()}`,
      name: shape,
      value: shape,
      enabled: true,
      customFields: shape === 'Custom',
      createdAt: new Date()
    }));
  }

  private getDefaultCakeFlavors(): SettingItem[] {
    return cakeFlavors.map(flavor => ({
      id: `flavor_${flavor.replace(/\s+/g, '_').toLowerCase()}`,
      name: flavor,
      value: flavor,
      enabled: true,
      createdAt: new Date()
    }));
  }

  private getDefaultColors(): ColorSettingItem[] {
    return baseColors.map(color => ({
      id: `color_${color.name.replace(/\s+/g, '_').toLowerCase()}`,
      name: color.name,
      value: color.value,
      enabled: true,
      createdAt: new Date()
    }));
  }

  private getDefaultPrintTemplate(): PrintTemplate {
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
        }
        // ... other sections would be added here for brevity
      ]
    };
  }

  private getDefaultDeliveryLabelTemplate(): DeliveryLabelTemplate {
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
            }
            // ... other fields would be added here for brevity
          ]
        }
      ]
    };
  }

  private getDefaultDriverSettings(): DriverSettings {
    return {
      driver1Name: "Driver 1",
      driver2Name: "Driver 2",
      driver1Vehicle: "Car",
      driver2Vehicle: "Car"
    };
  }
}
