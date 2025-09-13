import { MockCustomerRepository } from "../repositories/customer.repository";
import { MockOrderRepository } from "../repositories/order.repository";
import { MockSettingsRepository } from "../repositories/settings.repository";
import { MockBakerRepository } from "../repositories/baker.repository";
import { MockGalleryRepository } from "../repositories/gallery.repository";
import { OrderTag } from "@/types";

// Initialize the customer repository with some mock data
const customerRepository = new MockCustomerRepository();

// Initialize the order repository with some mock data
const orderRepository = new MockOrderRepository();

// Initialize the settings repository with some mock data
const settingsRepository = new MockSettingsRepository();

// Initialize the baker repository with some mock data
const bakerRepository = new MockBakerRepository();

// Initialize the gallery repository with mock data
const mockGalleryPhotos = [
  {
    id: "gallery-1",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    orderId: "order-1",
    orderInfo: {
      cakeShape: "Round",
      cakeSize: "Medium",
      cakeFlavor: "Chocolate",
      cakeDesign: "Birthday Princess",
      customerName: "Sarah Wilson"
    },
    tags: ["birthday", "for-kids"] as OrderTag[],
    createdAt: new Date("2024-01-15")
  },
  {
    id: "gallery-2", 
    imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400",
    orderId: "order-2",
    orderInfo: {
      cakeShape: "Heart",
      cakeSize: "Large", 
      cakeFlavor: "Red Velvet",
      cakeDesign: "Anniversary Gold",
      customerName: "John & Mary Smith"
    },
    tags: ["anniversary", "wedding"] as OrderTag[],
    createdAt: new Date("2024-01-20")
  },
  {
    id: "gallery-3",
    imageUrl: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400", 
    orderId: "order-3",
    orderInfo: {
      cakeShape: "Square",
      cakeSize: "Small",
      cakeFlavor: "Vanilla",
      cakeDesign: "Corporate Logo",
      customerName: "ABC Corp"
    },
    tags: ["other"] as OrderTag[],
    createdAt: new Date("2024-01-25")
  },
  {
    id: "gallery-4",
    imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400",
    orderId: "order-4", 
    orderInfo: {
      cakeShape: "Round",
      cakeSize: "Large",
      cakeFlavor: "Strawberry",
      cakeDesign: "Wedding White Roses",
      customerName: "Emma Johnson"
    },
    tags: ["wedding", "for-woman"] as OrderTag[],
    createdAt: new Date("2024-02-01")
  },
  {
    id: "gallery-5",
    imageUrl: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400",
    orderId: "order-5",
    orderInfo: {
      cakeShape: "Rectangular", 
      cakeSize: "Medium",
      cakeFlavor: "Chocolate",
      cakeDesign: "Superman Theme",
      customerName: "Tommy Brown"
    },
    tags: ["birthday", "for-kids"] as OrderTag[],
    createdAt: new Date("2024-02-05")
  },
  {
    id: "gallery-6",
    imageUrl: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400",
    orderId: "order-6",
    orderInfo: {
      cakeShape: "Round",
      cakeSize: "Medium", 
      cakeFlavor: "Lemon",
      cakeDesign: "Elegant Floral",
      customerName: "Lisa Garcia"
    },
    tags: ["birthday", "for-woman"] as OrderTag[],
    createdAt: new Date("2024-02-10")
  },
  {
    id: "gallery-7",
    imageUrl: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400",
    orderId: "order-7",
    orderInfo: {
      cakeShape: "Heart",
      cakeSize: "Small",
      cakeFlavor: "Red Velvet", 
      cakeDesign: "Valentine's Special",
      customerName: "David Miller"
    },
    tags: ["anniversary", "for-woman"] as OrderTag[],
    createdAt: new Date("2024-02-14")
  },
  {
    id: "gallery-8",
    imageUrl: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=400",
    orderId: "order-8",
    orderInfo: {
      cakeShape: "Round",
      cakeSize: "Large",
      cakeFlavor: "Vanilla",
      cakeDesign: "Gaming Controller",
      customerName: "Alex Chen"
    },
    tags: ["birthday", "for-man"] as OrderTag[],
    createdAt: new Date("2024-02-18")
  },
  {
    id: "gallery-9", 
    imageUrl: "https://images.unsplash.com/photo-1557925923-cd4648e211a0?w=400",
    orderId: "order-9",
    orderInfo: {
      cakeShape: "Square",
      cakeSize: "Medium",
      cakeFlavor: "Chocolate",
      cakeDesign: "Graduation Cap",
      customerName: "Jennifer Lee"
    },
    tags: ["other"] as OrderTag[],
    createdAt: new Date("2024-02-22")
  },
  {
    id: "gallery-10",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    orderId: "order-10",
    orderInfo: {
      cakeShape: "Round", 
      cakeSize: "Small",
      cakeFlavor: "Strawberry",
      cakeDesign: "Baby Shower Pastels",
      customerName: "Amanda Davis"
    },
    tags: ["other", "for-woman"] as OrderTag[],
    createdAt: new Date("2024-02-25")
  }
];

const mockCustomTags = [
  {
    id: "custom-tag-1",
    value: "corporate",
    label: "Corporate",
    count: 1,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "custom-tag-2", 
    value: "graduation",
    label: "Graduation",
    count: 1,
    createdAt: new Date("2024-01-05")
  },
  {
    id: "custom-tag-3",
    value: "baby-shower",
    label: "Baby Shower", 
    count: 1,
    createdAt: new Date("2024-01-10")
  }
];

const galleryRepository = new MockGalleryRepository(mockGalleryPhotos, mockCustomTags);

// Export all repositories
export const mockDataService = {
  customers: customerRepository,
  orders: orderRepository,
  settings: settingsRepository,
  baker: bakerRepository,
  gallery: galleryRepository
};
