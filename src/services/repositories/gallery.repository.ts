
import { BaseRepository } from "./base.repository";
import { GalleryPhoto, CustomTag, GalleryFilter, GallerySort } from "@/types/gallery";
import { Order, OrderTag } from "@/types";

export interface GalleryRepository extends BaseRepository<GalleryPhoto> {
  getPhotosByFilter(filter: GalleryFilter, sort: GallerySort): Promise<GalleryPhoto[]>;
  getPhotoDetail(photoId: string): Promise<GalleryPhoto | undefined>;
  getRelatedPhotos(photoId: string, limit?: number): Promise<GalleryPhoto[]>;
  getAllTags(): Promise<CustomTag[]>;
  createCustomTag(label: string): Promise<CustomTag>;
  addPhotoFromOrder(order: Order, imageUrl: string, tags: OrderTag[]): Promise<GalleryPhoto>;
}

export class MockGalleryRepository implements GalleryRepository {
  private photos: GalleryPhoto[] = [];
  private customTags: CustomTag[] = [];
  private nextTagId = 1;

  constructor(initialPhotos: GalleryPhoto[] = [], initialTags: CustomTag[] = []) {
    this.photos = initialPhotos;
    this.customTags = initialTags;
    
    if (this.customTags.length > 0) {
      // Find the highest ID to set nextTagId correctly
      const maxId = Math.max(...this.customTags.map(tag => 
        parseInt(tag.id.replace('custom-tag-', '')) || 0
      ));
      this.nextTagId = maxId + 1;
    }
  }

  async getAll(): Promise<GalleryPhoto[]> {
    return [...this.photos];
  }

  async getById(id: string): Promise<GalleryPhoto | undefined> {
    return this.photos.find(photo => photo.id === id);
  }

  async create(photo: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
    const id = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newPhoto = { ...photo, id };
    this.photos.unshift(newPhoto);
    return newPhoto;
  }

  async update(id: string, photo: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
    const index = this.photos.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Photo with id ${id} not found`);
    
    this.photos[index] = { ...this.photos[index], ...photo };
    return this.photos[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.photos.length;
    this.photos = this.photos.filter(p => p.id !== id);
    return initialLength !== this.photos.length;
  }

  async getPhotosByFilter(filter: GalleryFilter, sort: GallerySort = 'newest'): Promise<GalleryPhoto[]> {
    let filteredPhotos = [...this.photos];
    
    // Apply tag filter
    if (filter.tags && filter.tags.length > 0) {
      filteredPhotos = filteredPhotos.filter(photo => 
        filter.tags.some(tag => photo.tags.includes(tag))
      );
    }
    
    // Apply shape filter
    if (filter.shapes && filter.shapes.length > 0) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.orderInfo && filter.shapes.includes(photo.orderInfo.cakeShape)
      );
    }
    
    // Apply flavor filter
    if (filter.flavors && filter.flavors.length > 0) {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.orderInfo && filter.flavors.includes(photo.orderInfo.cakeFlavor)
      );
    }
    
    // Apply date range filter
    if (filter.dateRange) {
      const { from, to } = filter.dateRange;
      if (from) {
        filteredPhotos = filteredPhotos.filter(photo => 
          new Date(photo.createdAt) >= new Date(from)
        );
      }
      if (to) {
        filteredPhotos = filteredPhotos.filter(photo => 
          new Date(photo.createdAt) <= new Date(to)
        );
      }
    }
    
    // Apply search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredPhotos = filteredPhotos.filter(photo => {
        if (!photo.orderInfo) return false;
        
        return (
          photo.orderInfo.cakeDesign.toLowerCase().includes(query) ||
          photo.orderInfo.cakeShape.toLowerCase().includes(query) ||
          photo.orderInfo.cakeFlavor.toLowerCase().includes(query) ||
          photo.orderInfo.cakeSize.toLowerCase().includes(query) ||
          (photo.orderInfo.customerName && photo.orderInfo.customerName.toLowerCase().includes(query)) ||
          photo.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
    }
    
    // Apply sorting
    if (sort === 'newest') {
      filteredPhotos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      filteredPhotos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'popular') {
      // In a real app, this would be based on view counts or likes
      // For mock data, we'll just use the number of tags as a proxy for popularity
      filteredPhotos.sort((a, b) => b.tags.length - a.tags.length);
    }
    
    return filteredPhotos;
  }

  async getPhotoDetail(photoId: string): Promise<GalleryPhoto | undefined> {
    return this.photos.find(photo => photo.id === photoId);
  }

  async getRelatedPhotos(photoId: string, limit: number = 4): Promise<GalleryPhoto[]> {
    const photo = this.photos.find(p => p.id === photoId);
    if (!photo) return [];
    
    // Find photos with similar tags or cake characteristics
    let relatedPhotos = this.photos
      .filter(p => p.id !== photoId)
      .map(p => {
        // Calculate a similarity score
        let score = 0;
        
        // Count matching tags
        photo.tags.forEach(tag => {
          if (p.tags.includes(tag)) score += 3;
        });
        
        // Same cake shape
        if (photo.orderInfo && p.orderInfo && photo.orderInfo.cakeShape === p.orderInfo.cakeShape) {
          score += 2;
        }
        
        // Same cake flavor
        if (photo.orderInfo && p.orderInfo && photo.orderInfo.cakeFlavor === p.orderInfo.cakeFlavor) {
          score += 1;
        }
        
        return { photo: p, score };
      })
      .filter(item => item.score > 0) // Only include items with some similarity
      .sort((a, b) => b.score - a.score) // Sort by similarity score descending
      .map(item => item.photo)
      .slice(0, limit);
    
    return relatedPhotos;
  }

  async getAllTags(): Promise<CustomTag[]> {
    // Get built-in tags (OrderTag) + custom tags
    // Count occurrences in photos
    const tagCounts: Record<string, number> = {};
    
    // Count occurrences of each tag
    this.photos.forEach(photo => {
      photo.tags.forEach(tag => {
        if (tagCounts[tag]) {
          tagCounts[tag]++;
        } else {
          tagCounts[tag] = 1;
        }
      });
    });
    
    // Create the built-in tags list
    const builtInTags: CustomTag[] = [
      'for-kids', 'for-man', 'for-woman', 'birthday',
      'anniversary', 'wedding', 'other'
    ].map(tag => ({
      id: `builtin-${tag}`,
      value: tag,
      label: tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      count: tagCounts[tag] || 0,
      createdAt: new Date(0) // Set a very old date for built-in tags
    }));
    
    // Combine with custom tags
    const allTags = [
      ...builtInTags,
      ...this.customTags.map(tag => ({
        ...tag,
        count: tagCounts[tag.value] || 0
      }))
    ];
    
    return allTags;
  }

  async createCustomTag(label: string): Promise<CustomTag> {
    // Convert label to a valid tag value (lowercase-with-dashes)
    const value = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if tag already exists
    const existingTag = this.customTags.find(tag => tag.value === value);
    if (existingTag) return existingTag;
    
    // Create new tag
    const newTag: CustomTag = {
      id: `custom-tag-${this.nextTagId++}`,
      value,
      label,
      count: 0,
      createdAt: new Date()
    };
    
    this.customTags.push(newTag);
    return newTag;
  }

  async addPhotoFromOrder(order: Order, imageUrl: string, tags: OrderTag[]): Promise<GalleryPhoto> {
    // Create a new gallery photo from order data
    const newPhoto: Omit<GalleryPhoto, 'id'> = {
      imageUrl,
      orderId: order.id,
      orderInfo: {
        cakeShape: order.cakeShape,
        cakeSize: order.cakeSize,
        cakeFlavor: order.cakeFlavor,
        cakeDesign: order.cakeDesign,
        customerName: order.customer.name
      },
      tags,
      createdAt: new Date()
    };
    
    return await this.create(newPhoto);
  }
}
