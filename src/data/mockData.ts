
import { Customer, FilterOption, Ingredient, Order, OrderStatus, Address, PackingItem, CakeColor, CoverType, TierDetail } from "../types";
import { baseColors } from "./colorData";

// Mock Addresses
const createAddress = (id: string, text: string, area: "Jakarta" | "Bekasi", deliveryNotes?: string): Address => ({
  id,
  text,
  area,
  deliveryNotes,
  createdAt: new Date('2025-02-15'),
});

// Helper function to create a solid color
const createSolidColor = (color: string): CakeColor => ({
  type: 'solid',
  color
});

// Helper function to create a gradient color
const createGradientColor = (colors: string[]): CakeColor => ({
  type: 'gradient',
  colors
});

// Helper function to create a custom color
const createCustomColor = (notes: string, imageUrl?: string): CakeColor => ({
  type: 'custom',
  notes,
  imageUrl
});

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "Alice Johnson",
    whatsappNumber: "+6281234567890",
    email: "alice@example.com",
    addresses: [
      createAddress("addr1", "123 Cake Street, Jakarta Selatan", "Jakarta", "Leave with security"),
      createAddress("addr2", "456 Pastry Lane, Jakarta Utara", "Jakarta", "Call before delivery")
    ],
    createdAt: new Date('2025-02-15'),
  },
  {
    id: "c2",
    name: "Bob Smith",
    whatsappNumber: "+6282345678901",
    email: "bob@example.com",
    addresses: [
      createAddress("addr3", "456 Pastry Ave, Bekasi Timur", "Bekasi", "Apartment 3B, 3rd floor"),
      createAddress("addr4", "789 Cookie Blvd, Bekasi Utara", "Bekasi")
    ],
    createdAt: new Date('2025-03-10'),
  },
  {
    id: "c3",
    name: "Carol Davis",
    whatsappNumber: "+6283456789012",
    email: "carol@example.com",
    addresses: [
      createAddress("addr5", "789 Bakery Blvd, Jakarta Barat", "Jakarta", "Business address")
    ],
    createdAt: new Date('2025-03-28'),
  },
  {
    id: "c4",
    name: "David Wilson",
    whatsappNumber: "+6284567890123",
    addresses: [
      createAddress("addr6", "101 Donut Drive, Bekasi Selatan", "Bekasi"),
      createAddress("addr7", "202 Cupcake Court, Bekasi Barat", "Bekasi"),
      createAddress("addr8", "303 Eclair Estate, Jakarta Timur", "Jakarta")
    ],
    createdAt: new Date('2025-04-05'),
  },
  {
    id: "c5",
    name: "Eve Brown",
    whatsappNumber: "+6285678901234",
    email: "eve@example.com",
    addresses: [
      createAddress("addr9", "321 Muffin Lane, Jakarta Pusat", "Jakarta", "Ring doorbell twice"),
      createAddress("addr10", "654 Brownie Blvd, Bekasi Selatan", "Bekasi", "Weekend deliveries only")
    ],
    createdAt: new Date('2025-04-12'),
  },
];

// Mock Ingredients
export const mockIngredients: Record<string, Ingredient[]> = {
  "Double Chocolate": [
    { id: "i1", name: "Flour", quantity: 500, unit: "g" },
    { id: "i2", name: "Sugar", quantity: 300, unit: "g" },
    { id: "i3", name: "Cocoa Powder", quantity: 100, unit: "g" },
    { id: "i4", name: "Butter", quantity: 200, unit: "g" },
    { id: "i5", name: "Eggs", quantity: 4, unit: "pcs" },
  ],
  "Vanilla": [
    { id: "i1", name: "Flour", quantity: 500, unit: "g" },
    { id: "i2", name: "Sugar", quantity: 300, unit: "g" },
    { id: "i6", name: "Vanilla Extract", quantity: 10, unit: "ml" },
    { id: "i4", name: "Butter", quantity: 200, unit: "g" },
    { id: "i5", name: "Eggs", quantity: 4, unit: "pcs" },
  ]
};

export const defaultPackingItems: PackingItem[] = [
  { id: "p1", name: "Candles", checked: false },
  { id: "p2", name: "Big Knife", checked: false },
  { id: "p3", name: "Greeting Card", checked: false },
  { id: "p4", name: "Cake Topper", checked: false },
];

// Mock Orders with 2025 dates
export const mockOrders: Order[] = [
  // Today's deliveries (May 3, 2025)
  {
    id: "o1",
    customer: mockCustomers[0],
    status: "ready-to-deliver", // Ready for delivery today
    deliveryDate: new Date('2025-05-03'), // Today
    deliveryAddress: mockCustomers[0].addresses[0].text,
    deliveryAddressNotes: mockCustomers[0].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[0].addresses[0].area,
    cakeDesign: "Flower themed",
    cakeFlavor: "Double Chocolate",
    cakeSize: "16 CM",
    cakeShape: "Round",
    cakeTier: 1,
    useSameFlavor: true,
    coverColor: createSolidColor("#FFD1DC"), // Pink
    coverType: "buttercream" as CoverType,
    cakeText: "Happy Birthday Alice!",
    greetingCard: "Wishing you a fantastic day!",
    notes: "No nuts please",
    packingItems: [
      { id: "p1", name: "Candles", checked: true },
      { id: "p2", name: "Big Knife", checked: false },
      { id: "p3", name: "Greeting Card", checked: true },
      { id: "p4", name: "Cake Topper", checked: false },
    ],
    attachments: ["cake-design-1.jpg"],
    createdAt: new Date('2025-04-25'),
    updatedAt: new Date('2025-04-25'),
    ingredients: mockIngredients["Double Chocolate"],
    cakePrice: 350000,
    deliveryTimeSlot: "09:00 - 12:00", // Morning delivery
  },
  {
    id: "o2",
    customer: mockCustomers[1],
    status: "ready-to-deliver", // Ready for delivery today
    deliveryDate: new Date('2025-05-03'), // Today
    deliveryAddress: mockCustomers[1].addresses[0].text,
    deliveryAddressNotes: mockCustomers[1].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[1].addresses[0].area,
    cakeDesign: "Superhero themed",
    cakeFlavor: "Vanilla",
    cakeSize: "22 CM",
    cakeShape: "Round",
    cakeTier: 2,
    tierDetails: [
      { 
        tier: 1, 
        shape: "Round", 
        size: "22 CM", 
        height: "3 Layer - 15 CM",
        flavor: "Vanilla",
        coverType: "buttercream" as CoverType,
        coverColor: createSolidColor("#D3E4FD")
      },
      { 
        tier: 2, 
        shape: "Round", 
        size: "16 CM", 
        height: "2 Layer - 10 CM",
        flavor: "Double Chocolate",
        coverType: "buttercream" as CoverType,
        coverColor: createSolidColor("#FFD1DC")
      }
    ],
    useSameFlavor: false,
    coverColor: createGradientColor(["#D3E4FD", "#0EA5E9", "#1E3A8A"]), // Ocean Blue gradient
    coverType: "buttercream" as CoverType,
    cakeText: "Happy Birthday Bob!",
    packingItems: [
      { id: "p1", name: "Candles", checked: true },
      { id: "p2", name: "Big Knife", checked: true },
      { id: "p3", name: "Greeting Card", checked: false },
      { id: "p4", name: "Cake Topper", checked: true },
    ],
    attachments: ["cake-design-2.jpg"],
    createdAt: new Date('2025-04-28'),
    updatedAt: new Date('2025-04-29'),
    ingredients: mockIngredients["Vanilla"],
    cakePrice: 450000,
    deliveryTimeSlot: "13:00 - 17:00", // Afternoon delivery
  },
  {
    id: "o3",
    customer: mockCustomers[2],
    status: "in-delivery", // Currently in delivery today
    deliveryDate: new Date('2025-05-03'), // Today
    deliveryAddress: mockCustomers[2].addresses[0].text,
    deliveryAddressNotes: mockCustomers[2].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[2].addresses[0].area,
    cakeDesign: "Floral pattern",
    cakeFlavor: "Vanilla",
    cakeSize: "18 CM",
    cakeShape: "Square",
    cakeTier: 1,
    useSameFlavor: true,
    coverColor: createSolidColor("#FF0000"), // Red
    coverType: "buttercream" as CoverType,
    notes: "Extra frosting please",
    packingItems: defaultPackingItems,
    createdAt: new Date('2025-04-29'),
    updatedAt: new Date('2025-05-03'), // Updated today when delivery started
    ingredients: mockIngredients["Vanilla"],
    cakePrice: 250000,
    deliveryTimeSlot: "09:00 - 12:00", // Morning delivery
  },
  
  // Tomorrow's deliveries (May 4, 2025)
  {
    id: "o4",
    customer: mockCustomers[3],
    status: "ready-to-deliver", // Ready for delivery tomorrow
    deliveryDate: new Date('2025-05-04'), // Tomorrow
    deliveryAddress: mockCustomers[3].addresses[0].text,
    deliveryAddressNotes: mockCustomers[3].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[3].addresses[0].area,
    cakeDesign: "Minimalist",
    cakeFlavor: "Double Chocolate",
    cakeSize: "24 CM",
    cakeShape: "Round",
    cakeTier: 1,
    useSameFlavor: true,
    coverColor: createSolidColor("#FFFFFF"), // White
    coverType: "buttercream" as CoverType,
    cakeText: "Congratulations!",
    greetingCard: "Well done on your achievement!",
    packingItems: [
      { id: "p1", name: "Candles", checked: false },
      { id: "p2", name: "Big Knife", checked: true },
      { id: "p3", name: "Greeting Card", checked: true },
      { id: "p4", name: "Cake Topper", checked: false },
    ],
    attachments: ["cake-design-3.jpg"],
    createdAt: new Date('2025-04-20'),
    updatedAt: new Date('2025-04-28'),
    ingredients: mockIngredients["Double Chocolate"],
    cakePrice: 400000,
    deliveryTimeSlot: "13:00 - 17:00", // Afternoon delivery
  },
  
  // Day after tomorrow deliveries (May 5, 2025)
  {
    id: "o5",
    customer: mockCustomers[4],
    status: "ready-to-deliver", // Ready for delivery day after tomorrow
    deliveryDate: new Date('2025-05-05'), // Day after tomorrow
    deliveryAddress: mockCustomers[4].addresses[0].text,
    deliveryAddressNotes: mockCustomers[4].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[4].addresses[0].area,
    cakeDesign: "Beach themed",
    cakeFlavor: "Vanilla",
    cakeSize: "16 CM",
    cakeShape: "Square",
    cakeTier: 3,
    tierDetails: [
      { 
        tier: 1, 
        shape: "Square", 
        size: "24 CM", 
        height: "4 Layer - 20 CM", 
        flavor: "Vanilla",
        coverType: "buttercream" as CoverType,
        coverColor: createSolidColor("#40E0D0")
      },
      { 
        tier: 2, 
        shape: "Square", 
        size: "18 CM", 
        height: "3 Layer - 15 CM", 
        flavor: "Vanilla",
        coverType: "buttercream" as CoverType,
        coverColor: createSolidColor("#40E0D0") 
      },
      { 
        tier: 3, 
        shape: "Square", 
        size: "12 CM", 
        height: "2 Layer - 10 CM", 
        flavor: "Vanilla",
        coverType: "buttercream" as CoverType,
        coverColor: createSolidColor("#40E0D0")
      }
    ],
    useSameFlavor: true,
    coverColor: createSolidColor("#40E0D0"), // Turquoise
    coverType: "buttercream" as CoverType,
    cakeText: "Happy Anniversary!",
    notes: "Include a small gift box",
    packingItems: [
      { id: "p1", name: "Candles", checked: true },
      { id: "p2", name: "Big Knife", checked: true },
      { id: "p3", name: "Greeting Card", checked: true },
      { id: "p4", name: "Cake Topper", checked: false },
    ],
    attachments: ["cake-design-4.jpg"],
    createdAt: new Date('2025-04-15'),
    updatedAt: new Date('2025-04-30'),
    ingredients: mockIngredients["Vanilla"],
    cakePrice: 300000,
    deliveryTimeSlot: "09:00 - 12:00", // Morning delivery
  },
  
  // Add more orders with different statuses
  {
    id: "o6",
    customer: mockCustomers[0],
    status: "in-kitchen", // Still in kitchen
    kitchenStatus: "decorating",
    deliveryDate: new Date('2025-05-05'), // Day after tomorrow
    deliveryAddress: mockCustomers[0].addresses[1].text,
    deliveryAddressNotes: mockCustomers[0].addresses[1].deliveryNotes,
    deliveryArea: mockCustomers[0].addresses[1].area,
    cakeDesign: "Classic buttercream swirls",
    cakeFlavor: "Vanilla",
    cakeSize: "18 CM",
    cakeShape: "Round",
    cakeTier: 1,
    useSameFlavor: true,
    coverColor: createSolidColor("#E6E6FA"), // Lavender
    coverType: "buttercream" as CoverType,
    cakeText: "Happy Mother's Day!",
    notes: "Extra smooth buttercream finish, please",
    packingItems: defaultPackingItems,
    createdAt: new Date('2025-04-30'),
    updatedAt: new Date('2025-04-30'),
    ingredients: mockIngredients["Vanilla"],
    cakePrice: 320000,
  },
  {
    id: "o7",
    customer: mockCustomers[2],
    status: "in-delivery", // Currently in delivery (for tomorrow's date)
    deliveryDate: new Date('2025-05-04'), // Tomorrow
    deliveryAddress: mockCustomers[2].addresses[0].text,
    deliveryAddressNotes: mockCustomers[2].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[2].addresses[0].area,
    cakeDesign: "Galaxy theme with stars",
    cakeFlavor: "Double Chocolate",
    cakeSize: "22 CM",
    cakeShape: "Round",
    cakeTier: 1,
    useSameFlavor: true,
    coverColor: createGradientColor(["#000033", "#191970", "#4B0082"]), // Dark blue to purple
    coverType: "buttercream" as CoverType,
    cakeText: "You're out of this world!",
    notes: "Use edible glitter for stars",
    packingItems: defaultPackingItems,
    createdAt: new Date('2025-04-29'),
    updatedAt: new Date('2025-05-03'), // Updated today when delivery started
    ingredients: mockIngredients["Double Chocolate"],
    cakePrice: 375000,
    deliveryTimeSlot: "13:00 - 17:00", // Afternoon delivery
  },
  {
    id: "o8",
    customer: mockCustomers[1],
    status: "delivery-confirmed", // Already delivered
    deliveryDate: new Date('2025-05-02'), // Yesterday
    deliveryAddress: mockCustomers[1].addresses[1].text,
    deliveryAddressNotes: mockCustomers[1].addresses[1].deliveryNotes,
    deliveryArea: mockCustomers[1].addresses[1].area,
    cakeDesign: "Geometric pattern",
    cakeFlavor: "Double Chocolate",
    cakeSize: "16 CM",
    cakeShape: "Round",
    cakeTier: 1,
    useSameFlavor: true,
    coverColor: createSolidColor("#F5F5DC"), // Beige
    coverType: "buttercream" as CoverType,
    cakeText: "Happy Birthday John!",
    packingItems: defaultPackingItems,
    createdAt: new Date('2025-04-20'),
    updatedAt: new Date('2025-05-02'), // Updated yesterday when delivered
    ingredients: mockIngredients["Double Chocolate"],
    cakePrice: 300000,
    deliveryTimeSlot: "09:00 - 12:00", // Morning delivery
  }
];

// Filter Options
export const statusFilterOptions: FilterOption[] = [
  { id: "all", label: "All Orders", value: "all" },
  { id: "incomplete", label: "Incomplete", value: "incomplete" },
  { id: "in-queue", label: "In Queue", value: "in-queue" },
  { id: "in-kitchen", label: "In Kitchen", value: "in-kitchen" },
  { id: "waiting-photo", label: "Waiting Photo", value: "waiting-photo" },
  { id: "ready", label: "Ready", value: "ready-to-deliver" }, // Updated value to match new status
  { id: "delivered", label: "Delivered", value: "delivery-confirmed" }, // Updated value to match new status
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
  "Vanilla",
  "Double Chocolate"
];

export const cakeSizes = [
  "12 CM",
  "16 CM", 
  "18 CM",
  "22 CM",
  "24 CM",
  "25 CM",
  "30 CM",
  "35 CM",
  "45 CM",
  "50 CM",
];

export const cakeShapes = [
  "Round",
  "Square",
  "Custom"
];

export const cakeTiers = [
  1, 2, 3
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

// Area options
export const areaOptions = [
  "Jakarta",
  "Bekasi"
];
