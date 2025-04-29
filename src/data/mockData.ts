
import { Customer, FilterOption, Ingredient, Order, OrderStatus } from "../types";

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "Alice Johnson",
    whatsappNumber: "+6281234567890",
    email: "alice@example.com",
    address: "123 Cake Street, Jakarta",
    createdAt: new Date('2024-02-15'),
  },
  {
    id: "c2",
    name: "Bob Smith",
    whatsappNumber: "+6282345678901",
    email: "bob@example.com",
    address: "456 Pastry Ave, Bandung",
    createdAt: new Date('2024-03-10'),
  },
  {
    id: "c3",
    name: "Carol Davis",
    whatsappNumber: "+6283456789012",
    email: "carol@example.com",
    address: "789 Bakery Blvd, Surabaya",
    createdAt: new Date('2024-03-28'),
  },
  {
    id: "c4",
    name: "David Wilson",
    whatsappNumber: "+6284567890123",
    createdAt: new Date('2024-04-05'),
  },
  {
    id: "c5",
    name: "Eve Brown",
    whatsappNumber: "+6285678901234",
    email: "eve@example.com",
    address: "321 Muffin Lane, Bali",
    createdAt: new Date('2024-04-12'),
  },
];

// Mock Ingredients
export const mockIngredients: Record<string, Ingredient[]> = {
  "Chocolate Cake": [
    { id: "i1", name: "Flour", quantity: 500, unit: "g" },
    { id: "i2", name: "Sugar", quantity: 300, unit: "g" },
    { id: "i3", name: "Cocoa Powder", quantity: 100, unit: "g" },
    { id: "i4", name: "Butter", quantity: 200, unit: "g" },
    { id: "i5", name: "Eggs", quantity: 4, unit: "pcs" },
  ],
  "Vanilla Cake": [
    { id: "i1", name: "Flour", quantity: 500, unit: "g" },
    { id: "i2", name: "Sugar", quantity: 300, unit: "g" },
    { id: "i6", name: "Vanilla Extract", quantity: 10, unit: "ml" },
    { id: "i4", name: "Butter", quantity: 200, unit: "g" },
    { id: "i5", name: "Eggs", quantity: 4, unit: "pcs" },
  ],
  "Red Velvet": [
    { id: "i1", name: "Flour", quantity: 500, unit: "g" },
    { id: "i2", name: "Sugar", quantity: 300, unit: "g" },
    { id: "i3", name: "Cocoa Powder", quantity: 20, unit: "g" },
    { id: "i4", name: "Butter", quantity: 200, unit: "g" },
    { id: "i5", name: "Eggs", quantity: 4, unit: "pcs" },
    { id: "i7", name: "Red Food Coloring", quantity: 30, unit: "ml" },
    { id: "i8", name: "Buttermilk", quantity: 240, unit: "ml" },
  ]
};

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: "o1",
    customer: mockCustomers[0],
    status: "confirmed",
    deliveryDate: new Date('2024-05-05'),
    deliveryAddress: "123 Cake Street, Jakarta",
    cakeDesign: "Flower themed",
    cakeFlavor: "Chocolate Cake",
    cakeSize: "8 inch",
    coverColor: "Pink",
    cakeText: "Happy Birthday Alice!",
    greetingCard: "Wishing you a fantastic day!",
    notes: "No nuts please",
    attachments: ["cake-design-1.jpg"],
    createdAt: new Date('2024-04-25'),
    updatedAt: new Date('2024-04-25'),
    ingredients: mockIngredients["Chocolate Cake"],
    totalPrice: 350000,
  },
  {
    id: "o2",
    customer: mockCustomers[1],
    status: "in-progress",
    deliveryDate: new Date('2024-05-10'),
    deliveryAddress: "456 Pastry Ave, Bandung",
    cakeDesign: "Superhero themed",
    cakeFlavor: "Vanilla Cake",
    cakeSize: "10 inch",
    coverColor: "Blue",
    cakeText: "Happy Birthday Bob!",
    attachments: ["cake-design-2.jpg"],
    createdAt: new Date('2024-04-28'),
    updatedAt: new Date('2024-04-29'),
    ingredients: mockIngredients["Vanilla Cake"],
    totalPrice: 450000,
  },
  {
    id: "o3",
    customer: mockCustomers[2],
    status: "draft",
    deliveryDate: new Date('2024-05-15'),
    deliveryAddress: "789 Bakery Blvd, Surabaya",
    cakeDesign: "Floral pattern",
    cakeFlavor: "Red Velvet",
    cakeSize: "6 inch",
    coverColor: "Red",
    notes: "Extra frosting please",
    createdAt: new Date('2024-04-29'),
    updatedAt: new Date('2024-04-29'),
    ingredients: mockIngredients["Red Velvet"],
    totalPrice: 250000,
  },
  {
    id: "o4",
    customer: mockCustomers[3],
    status: "ready",
    deliveryDate: new Date('2024-05-03'),
    deliveryAddress: "101 Donut Drive, Yogyakarta",
    cakeDesign: "Minimalist",
    cakeFlavor: "Chocolate Cake",
    cakeSize: "9 inch",
    coverColor: "White",
    cakeText: "Congratulations!",
    greetingCard: "Well done on your achievement!",
    attachments: ["cake-design-3.jpg"],
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-04-28'),
    ingredients: mockIngredients["Chocolate Cake"],
    totalPrice: 400000,
  },
  {
    id: "o5",
    customer: mockCustomers[4],
    status: "delivered",
    deliveryDate: new Date('2024-04-30'),
    deliveryAddress: "321 Muffin Lane, Bali",
    cakeDesign: "Beach themed",
    cakeFlavor: "Vanilla Cake",
    cakeSize: "7 inch",
    coverColor: "Turquoise",
    cakeText: "Happy Anniversary!",
    notes: "Include a small gift box",
    attachments: ["cake-design-4.jpg"],
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-04-30'),
    ingredients: mockIngredients["Vanilla Cake"],
    totalPrice: 300000,
  },
];

// Filter Options
export const statusFilterOptions: FilterOption[] = [
  { id: "all", label: "All Orders", value: "all" },
  { id: "draft", label: "Draft", value: "draft" },
  { id: "confirmed", label: "Confirmed", value: "confirmed" },
  { id: "in-progress", label: "In Progress", value: "in-progress" },
  { id: "ready", label: "Ready", value: "ready" },
  { id: "delivered", label: "Delivered", value: "delivered" },
  { id: "cancelled", label: "Cancelled", value: "cancelled" },
];

export const timeFilterOptions: FilterOption[] = [
  { id: "all", label: "All Time", value: "all" },
  { id: "today", label: "Today", value: "today" },
  { id: "this-week", label: "This Week", value: "this-week" },
  { id: "this-month", label: "This Month", value: "this-month" },
];

// Cake options
export const cakeFlavors = [
  "Chocolate Cake",
  "Vanilla Cake", 
  "Red Velvet",
  "Carrot Cake",
  "Lemon Cake",
  "Coffee Cake",
  "Marble Cake",
  "Strawberry Cake",
];

export const cakeSizes = [
  "4 inch",
  "6 inch", 
  "8 inch",
  "9 inch",
  "10 inch",
  "12 inch",
  "14 inch",
  "16 inch",
];

export const cakeColors = [
  "White",
  "Pink",
  "Blue",
  "Yellow",
  "Green",
  "Purple",
  "Red",
  "Black",
  "Gold",
  "Silver",
  "Turquoise",
  "Orange",
];
