
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
export type DriverType = 'driver-1' | 'driver-2' | '3rd-party';

export type FlatRateTimeSlot = 'slot1' | 'slot2' | 'slot3';

// New type for delivery assignment
export interface DeliveryAssignment {
  driverType: DriverType;
  driverName?: string; // Optional for 3rd-party driver names
  assignedAt: Date;
  assignedBy?: string;
  notes?: string; // Optional delivery instructions
  status?: 'pending' | 'in-progress' | 'completed';
  isPreliminary?: boolean; // Field to indicate pre-assignment
  vehicleInfo?: string; // New field to store vehicle information for data collection
}

// New type for print event tracking
export interface PrintEvent {
  type: 'order-form' | 'delivery-label';
  timestamp: Date;
  user?: string; // Can be used for tracking who printed
}

// New type for order log events
export interface OrderLogEvent {
  id: string;
  timestamp: Date;
  type: 'status-change' | 'photo-upload' | 'note-added' | 'delivery-update' | 'feedback-added' | 'print' | 'driver-assigned';
  previousStatus?: OrderStatus;
  newStatus?: OrderStatus;
  user?: string;
  note?: string;
  metadata?: Record<string, any>;
}

// New type for order metadata/tags
export type OrderTag = 'for-kids' | 'for-man' | 'for-woman' | 'anniversary' | 'birthday' | 'wedding' | 'other';

export type CakeRevision = {
  id: string;
  timestamp: Date;
  photos: string[];
  notes?: string;
  requestedBy?: string;
};

// New type for trip status
export type TripStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

// New type for Trip
export interface Trip {
  id: string;
  name: string;          // E.g., "Morning Trip 1"
  driverType: DriverType; // driver-1, driver-2, or 3rd-party
  driverName?: string;   // Custom driver name
  vehicleInfo?: string;  // Vehicle information
  date: Date;            // Trip date
  startTime?: Date;      // Planned start time
  endTime?: Date;        // Expected end time
  status: TripStatus;
  notes?: string;        // Trip notes
  createdAt: Date;
  updatedAt: Date;
  orderIds: string[];    // List of order IDs in this trip
  completedOrderIds: string[]; // Orders completed in this trip
  sequence: Record<string, number>; // Order sequence mapping {orderId: sequenceNumber}
  routeDistance?: number; // Optional estimated route distance
  routeDuration?: number; // Optional estimated route duration
}

export type Order = {
  id: string;
  customer: Customer;
  status: OrderStatus;
  kitchenStatus?: KitchenOrderStatus;
  orderDate?: Date;
  deliveryDate: Date;
  deliveryAddress: string;
  deliveryAddressNotes?: string;
  deliveryArea?: string;
  cakeDesign: string;
  cakeFlavor: string;
  cakeSize: string;
  cakeShape: string;
  customShape?: string;
  cakeTier: number;
  tierDetails?: TierDetail[];
  useSameFlavor: boolean;
  useSameCover?: boolean;
  coverColor: CakeColor;
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
  printHistory?: PrintEvent[];
  finishedCakePhotos?: string[];
  deliveryDocumentationPhotos?: string[];
  actualDeliveryTime?: Date;
  customerFeedback?: string;
  orderTags?: OrderTag[];
  archivedDate?: Date; // Add field to track when the order was archived
  orderLogs?: OrderLogEvent[]; // Add new field for order logs
  
  // New fields for the approval and revision process
  revisionCount?: number;
  revisionHistory?: CakeRevision[];
  revisionNotes?: string;
  approvedBy?: string;
  approvalDate?: Date;
  
  // New field for driver assignment
  deliveryAssignment?: DeliveryAssignment;
  
  // New fields for trip planning
  tripId?: string;       // Reference to the trip this order is part of
  tripSequence?: number; // Sequence number in the trip
};

export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export type OrderStatus = 
  'incomplete' | 
  'in-queue' | 
  'in-kitchen' | 
  'waiting-photo' | 
  'pending-approval' |  // New status: photos uploaded but not yet approved
  'needs-revision' |    // New status: photos rejected, needs new photos
  'ready-to-deliver' | 
  'in-delivery' | 
  // 'delivery-confirmed' is now removed as it's redundant
  'waiting-feedback' |
  'finished' |
  'archived' |
  'cancelled';

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

// New interface for driver settings
export interface DriverSettings {
  driver1Name: string;
  driver2Name: string;
  driver1Vehicle: string;  // New field for driver 1's vehicle
  driver2Vehicle: string;  // New field for driver 2's vehicle
  defaultDriverType?: DriverType;
}

export type SettingsData = {
  cakeSizes: SettingItem[];
  cakeShapes: ShapeSettingItem[];
  cakeFlavors: SettingItem[];
  colors: ColorSettingItem[];
  printTemplate: PrintTemplate;
  deliveryLabelTemplate: DeliveryLabelTemplate;
  driverSettings: DriverSettings;
};

