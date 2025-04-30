
export type Address = {
  id: string;
  text: string;
  deliveryNotes?: string;
  area: "Jakarta" | "Bekasi" | string; // Making it extensible for future areas
  createdAt: Date;
  updatedAt?: Date;
};

export type Customer = {
  id: string;
  name: string;
  whatsappNumber: string;
  email?: string;
  addresses: Address[];
  createdAt: Date;
  updatedAt?: Date;
  orders?: Order[];
  // The following properties are computed and not stored in the repository
  totalOrders?: number;
  totalSpend?: number;
  lastOrderDate?: Date;
};

export type CoverType = "buttercream" | "fondant";

export type TierDetail = {
  tier: number;
  shape: string;
  size: string;
  height?: string;
  flavor?: string;
  coverType: CoverType;
  coverColor: CakeColor;
  customShape?: string; // Add customShape field for custom shapes
};

export type PackingItem = {
  id: string;
  name: string;
  checked: boolean;
};

export type ColorType = 'solid' | 'gradient' | 'custom';

export interface SolidColor {
  type: 'solid';
  color: string;
}

export interface GradientColor {
  type: 'gradient';
  colors: string[];
}

export interface CustomColor {
  type: 'custom';
  notes: string;
  imageUrl?: string;
}

export type CakeColor = SolidColor | GradientColor | CustomColor;

export type DeliveryMethod = 'flat-rate' | 'lalamove' | 'self-pickup';

export type FlatRateTimeSlot = 'slot1' | 'slot2' | 'slot3';

export type Order = {
  id: string;
  customer: Customer;
  status: OrderStatus;
  orderDate?: Date;
  deliveryDate: Date;
  deliveryAddress: string;
  deliveryAddressNotes?: string;
  deliveryArea?: string;
  cakeDesign: string;
  cakeFlavor: string;
  cakeSize: string;
  cakeShape: string;
  customShape?: string; // Add customShape field for the order
  cakeTier: number;
  tierDetails?: TierDetail[];
  useSameFlavor: boolean;
  useSameCover?: boolean;
  coverColor: CakeColor; // Support both legacy string and new color structure
  coverType?: CoverType;
  cakeText?: string;
  greetingCard?: string;
  notes?: string;
  packingItems?: PackingItem[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  ingredients?: Ingredient[];
  cakePrice: number;
  deliveryMethod?: DeliveryMethod;
  deliveryTimeSlot?: string;
  deliveryPrice?: number;
};

export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export type OrderStatus = 'draft' | 'confirmed' | 'in-progress' | 'ready' | 'delivered' | 'cancelled';

export type FilterOption = {
  id: string;
  label: string;
  value: string;
};

export type ViewMode = 'list' | 'grid';

// New types for settings management
export type SettingCategory = 'cakeSize' | 'cakeShape' | 'cakeFlavor' | 'color';

export interface SettingItem {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ColorSettingItem extends SettingItem {
  value: string; // hex color code
}

export interface ShapeSettingItem extends SettingItem {
  customFields?: boolean; // Whether this shape requires additional custom fields
}

export type SettingsData = {
  cakeSizes: SettingItem[];
  cakeShapes: ShapeSettingItem[];
  cakeFlavors: SettingItem[];
  colors: ColorSettingItem[];
};
