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

// New type for print event tracking
export interface PrintEvent {
  type: 'order-form' | 'delivery-label';
  timestamp: Date;
  user?: string; // Can be used for tracking who printed
}

// New type for order metadata/tags
export type OrderTag = 'for-kids' | 'for-man' | 'for-woman' | 'anniversary' | 'birthday' | 'wedding' | 'other';

export type Order = {
  id: string;
  customer: Customer;
  status: OrderStatus;
  kitchenStatus?: KitchenOrderStatus; // Add kitchenStatus field to track kitchen-specific status
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
  printHistory?: PrintEvent[]; // New field to track print history
  finishedCakePhotos?: string[]; // URLs or base64 encoded images
  actualDeliveryTime?: Date; // When the cake was actually delivered
  customerFeedback?: string; // Any feedback or complaints
  orderTags?: OrderTag[]; // Metadata tags for the order
};

export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export type OrderStatus = 'incomplete' | 'in-queue' | 'in-kitchen' | 'ready' | 'delivered' | 'cancelled' | 'waiting-photo';

// Kitchen-specific status types
export type KitchenOrderStatus = 
  'waiting-baker' |  // Cake not baked yet or not in stock
  'waiting-crumbcoat' | 
  'waiting-cover' | 
  'decorating' |  // Changed from 'in-progress' to 'decorating'
  'done-waiting-approval';  // Done but needs approval

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

// New types for print form customization
export type PrintFieldType = 'section-title' | 'text' | 'field' | 'separator' | 'spacer' | 'qr-code';

// Text styling options for print fields
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type FontStyle = 'normal' | 'italic';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export interface PrintField {
  id: string;
  type: PrintFieldType;
  label?: string;
  value?: string;
  fieldKey?: string; // References Order object field path
  enabled: boolean;
  order: number;
  size?: number; // For QR code size
  // New styling properties
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  fontSize?: FontSize;
}

export interface PrintSection {
  id: string;
  title: string;
  fields: PrintField[];
  enabled: boolean;
  order: number;
}

export interface PrintTemplate {
  title: string;
  orientation: 'portrait' | 'landscape';
  sections: PrintSection[];
}

// New types for delivery label template
export type DeliveryLabelFieldType = 'section-title' | 'text' | 'field' | 'separator' | 'spacer' | 'qr-code';

export interface DeliveryLabelField {
  id: string;
  type: DeliveryLabelFieldType;
  label?: string;
  value?: string;
  fieldKey?: string; // References Order object field path
  enabled: boolean;
  order: number;
  size?: number; // For QR code size
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  fontSize?: FontSize;
}

export interface DeliveryLabelSection {
  id: string;
  title: string;
  fields: DeliveryLabelField[];
  enabled: boolean;
  order: number;
}

export interface DeliveryLabelTemplate {
  title: string;
  sections: DeliveryLabelSection[];
}

export type SettingsData = {
  cakeSizes: SettingItem[];
  cakeShapes: ShapeSettingItem[];
  cakeFlavors: SettingItem[];
  colors: ColorSettingItem[];
  printTemplate: PrintTemplate;
  deliveryLabelTemplate: DeliveryLabelTemplate; // New field for delivery label template
};
