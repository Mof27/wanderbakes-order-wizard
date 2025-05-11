
import { Order, OrderTag } from "./index";

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  orderId: string;
  orderInfo?: {
    cakeShape: string;
    cakeSize: string;
    cakeFlavor: string;
    cakeDesign: string;
    customerName?: string;
  };
  tags: OrderTag[];
  createdAt: Date;
}

export interface CustomTag {
  id: string;
  value: string;
  label: string;
  count: number;
  createdAt: Date;
}

export type GalleryFilter = {
  tags: OrderTag[];
  shapes: string[];
  flavors: string[];
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  searchQuery?: string;
};

export type GallerySort = 'newest' | 'oldest' | 'popular';

export interface GalleryPhotoDetail extends GalleryPhoto {
  order?: Order;
  relatedPhotos?: GalleryPhoto[];
}
