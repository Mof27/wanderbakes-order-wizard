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
  ],
  "Red Velvet": [
    { id: "i1", name: "Flour", quantity: 450, unit: "g" },
    { id: "i2", name: "Sugar", quantity: 350, unit: "g" },
    { id: "i3", name: "Cocoa Powder", quantity: 50, unit: "g" },
    { id: "i4", name: "Butter", quantity: 180, unit: "g" },
    { id: "i5", name: "Eggs", quantity: 3, unit: "pcs" },
    { id: "i7", name: "Red Food Coloring", quantity: 30, unit: "ml" },
    { id: "i8", name: "Buttermilk", quantity: 250, unit: "ml" },
  ]
};

export const defaultPackingItems: PackingItem[] = [
  { id: "p1", name: "Candles", checked: false },
  { id: "p2", name: "Big Knife", checked: false },
  { id: "p3", name: "Greeting Card", checked: false },
  { id: "p4", name: "Cake Topper", checked: false },
];

// Updated Mock Orders - only 3 detailed examples with in-queue status
export const mockOrders: Order[] = [
  // Order 1: Single-tier cake with solid color
  {
    id: "o1",
    customer: mockCustomers[0],
    status: "in-queue", // All orders set to "in-queue"
    deliveryDate: new Date('2025-05-05'), // Tomorrow
    deliveryAddress: mockCustomers[0].addresses[0].text,
    deliveryAddressNotes: mockCustomers[0].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[0].addresses[0].area,
    cakeDesign: "Elegant Floral Pattern",
    cakeFlavor: "Vanilla",
    cakeSize: "22 CM",
    cakeShape: "Round",
    cakeTier: 1,
    useSameFlavor: true,
    coverColor: createSolidColor("#FFD1DC"), // Pink
    coverType: "buttercream" as CoverType,
    cakeText: "Happy Birthday Mom!",
    greetingCard: "Wishing you a wonderful day filled with joy and happiness!",
    notes: "Please make the flowers look elegant and use high-quality fondant decorations",
    packingItems: [
      { id: "p1", name: "Candles", checked: true },
      { id: "p2", name: "Big Knife", checked: true },
      { id: "p3", name: "Greeting Card", checked: true },
      { id: "p4", name: "Cake Topper", checked: false },
    ],
    attachments: ["floral-cake-inspiration.jpg"],
    createdAt: new Date('2025-05-01'), // Created a few days ago
    updatedAt: new Date('2025-05-02'), 
    ingredients: mockIngredients["Vanilla"],
    cakePrice: 450000,
    deliveryTimeSlot: "13:00 - 17:00", // Afternoon delivery
    deliveryMethod: "flat-rate",
    deliveryPrice: 50000,
    orderTags: ["birthday", "for-woman"],
  },
  
  // Order 2: Two-tier cake with gradient color
  {
    id: "o2",
    customer: mockCustomers[1],
    status: "in-queue",
    deliveryDate: new Date('2025-05-10'), // Next week
    deliveryAddress: mockCustomers[1].addresses[0].text,
    deliveryAddressNotes: mockCustomers[1].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[1].addresses[0].area,
    cakeDesign: "Modern Geometric Pattern",
    cakeFlavor: "Double Chocolate",
    cakeSize: "24 CM",
    cakeShape: "Square",
    cakeTier: 2,
    tierDetails: [
      { 
        tier: 1, 
        shape: "Square", 
        size: "24 CM", 
        height: "3 Layer - 15 CM",
        flavor: "Double Chocolate",
        coverType: "fondant" as CoverType,
        coverColor: createSolidColor("#0EA5E9")
      },
      { 
        tier: 2, 
        shape: "Square", 
        size: "16 CM", 
        height: "2 Layer - 10 CM",
        flavor: "Vanilla",
        coverType: "fondant" as CoverType,
        coverColor: createSolidColor("#D3E4FD")
      }
    ],
    useSameFlavor: false,
    useSameCover: true,
    coverColor: createGradientColor(["#0EA5E9", "#1E3A8A", "#D3E4FD"]), // Ocean Blue gradient
    coverType: "fondant" as CoverType,
    cakeText: "Happy Anniversary Bob & Carol!",
    greetingCard: "Celebrating 10 wonderful years together!",
    notes: "Clean, modern design with sharp edges. Gold accents on the geometric pattern would be nice.",
    packingItems: [
      { id: "p1", name: "Candles", checked: false },
      { id: "p2", name: "Big Knife", checked: true },
      { id: "p3", name: "Greeting Card", checked: true },
      { id: "p4", name: "Cake Topper", checked: true },
    ],
    attachments: ["geometric-design.jpg", "anniversary-topper.jpg"],
    createdAt: new Date('2025-04-25'),
    updatedAt: new Date('2025-04-28'),
    ingredients: [...mockIngredients["Double Chocolate"], ...mockIngredients["Vanilla"]],
    cakePrice: 750000,
    deliveryTimeSlot: "09:00 - 12:00", // Morning delivery
    deliveryMethod: "lalamove", 
    deliveryPrice: 75000,
    orderTags: ["anniversary"],
  },
  
  // Order 3: Three-tier cake with custom color
  {
    id: "o3",
    customer: mockCustomers[2],
    status: "in-queue",
    deliveryDate: new Date('2025-05-04'), // Today
    deliveryAddress: mockCustomers[2].addresses[0].text,
    deliveryAddressNotes: mockCustomers[2].addresses[0].deliveryNotes,
    deliveryArea: mockCustomers[2].addresses[0].area,
    cakeDesign: "Galaxy Theme with Gold Accents",
    cakeFlavor: "Red Velvet",
    cakeSize: "30 CM",
    cakeShape: "Round",
    cakeTier: 3,
    tierDetails: [
      { 
        tier: 1, 
        shape: "Round", 
        size: "30 CM", 
        height: "4 Layer - 20 CM", 
        flavor: "Red Velvet",
        coverType: "buttercream" as CoverType,
        coverColor: createCustomColor("Deep blue base with purple swirls", "galaxy-bottom-tier.jpg")
      },
      { 
        tier: 2, 
        shape: "Round", 
        size: "22 CM", 
        height: "3 Layer - 15 CM", 
        flavor: "Red Velvet",
        coverType: "buttercream" as CoverType,
        coverColor: createCustomColor("Purple base with pink accents", "galaxy-middle-tier.jpg")
      },
      { 
        tier: 3, 
        shape: "Round", 
        size: "16 CM", 
        height: "2 Layer - 10 CM", 
        flavor: "Red Velvet",
        coverType: "buttercream" as CoverType,
        coverColor: createCustomColor("Dark purple with gold stars", "galaxy-top-tier.jpg")
      }
    ],
    useSameFlavor: true,
    coverColor: createCustomColor("Galaxy theme with deep blues, purples, and gold/silver star accents", "galaxy-cake-reference.jpg"),
    coverType: "buttercream" as CoverType,
    cakeText: "",
    greetingCard: "To the stars and beyond! Happy Graduation!",
    notes: "Please make it look like a galaxy/space theme with edible gold stars and silver accents. Client provided reference images.",
    packingItems: [
      { id: "p1", name: "Candles", checked: true },
      { id: "p2", name: "Big Knife", checked: true },
      { id: "p3", name: "Greeting Card", checked: true },
      { id: "p4", name: "Cake Topper", checked: true },
    ],
    attachments: ["galaxy-cake-reference.jpg", "star-decoration-example.jpg", "graduation-topper.jpg"],
    createdAt: new Date('2025-04-20'),
    updatedAt: new Date('2025-05-01'),
    ingredients: mockIngredients["Red Velvet"],
    cakePrice: 1200000,
    deliveryTimeSlot: "13:00 - 17:00", 
    deliveryMethod: "flat-rate",
    deliveryPrice: 65000,
    orderTags: ["graduation", "for-kids"],
  }
];

// Keep existing filter options
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

// Keep existing timeFilterOptions
export const timeFilterOptions: FilterOption[] = [
  { id: "all", label: "All Time", value: "all" },
  { id: "today", label: "Today", value: "today" },
  { id: "this-week", label: "This Week", value: "this-week" },
  { id: "this-month", label: "This Month", value: "this-month" },
];

// Keep existing cake options
export const cakeFlavors = [
  "Vanilla",
  "Double Chocolate",
  "Red Velvet"
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
