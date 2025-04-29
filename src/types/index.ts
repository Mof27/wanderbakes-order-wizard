
export type Customer = {
  id: string;
  name: string;
  whatsappNumber: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt?: Date; // Added updatedAt property as optional
  orders?: Order[];
};

export type Order = {
  id: string;
  customer: Customer;
  status: OrderStatus;
  deliveryDate: Date;
  deliveryAddress: string;
  cakeDesign: string;
  cakeFlavor: string;
  cakeSize: string;
  coverColor: string;
  cakeText?: string;
  greetingCard?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  ingredients?: Ingredient[];
  totalPrice: number;
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
