import { supabase } from "@/integrations/supabase/client";
import { GalleryRepository } from "../gallery.repository";
import { GalleryPhoto, CustomTag, GalleryFilter, GallerySort } from "@/types/gallery";
import { Order, OrderTag } from "@/types";

export class LiveGalleryRepository implements GalleryRepository {
  
  async getAll(): Promise<GalleryPhoto[]> {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(this.mapToGalleryPhoto);
  }

  async getById(id: string): Promise<GalleryPhoto | undefined> {
    const { data, error } = await supabase
      .from('gallery_photos')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return undefined; // No rows found
      throw error;
    }
    
    return this.mapToGalleryPhoto(data);
  }

  async create(photo: Omit<GalleryPhoto, 'id'>): Promise<GalleryPhoto> {
    const { data, error } = await supabase
      .from('gallery_photos')
      .insert({
        image_url: photo.imageUrl,
        order_id: photo.orderId,
        order_info: photo.orderInfo,
        view_count: 0
      })
      .select()
      .single();
      
    if (error) throw error;
    
    const galleryPhoto = this.mapToGalleryPhoto(data);
    
    // Insert tags
    if (photo.tags.length > 0) {
      await this.insertPhotoTags(galleryPhoto.id, photo.tags);
    }
    
    return galleryPhoto;
  }

  async update(id: string, photo: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
    const updateData: any = {};
    
    if (photo.imageUrl !== undefined) updateData.image_url = photo.imageUrl;
    if (photo.orderInfo !== undefined) updateData.order_info = photo.orderInfo;
    
    const { data, error } = await supabase
      .from('gallery_photos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Update tags if provided
    if (photo.tags !== undefined) {
      // Delete existing tags
      await supabase
        .from('photo_tags')
        .delete()
        .eq('photo_id', id);
        
      // Insert new tags
      if (photo.tags.length > 0) {
        await this.insertPhotoTags(id, photo.tags);
      }
    }
    
    return this.mapToGalleryPhoto(data);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('gallery_photos')
      .delete()
      .eq('id', id);
      
    return !error;
  }

  async getPhotosByFilter(filter: GalleryFilter, sort: GallerySort = 'newest'): Promise<GalleryPhoto[]> {
    let query = supabase
      .from('gallery_photos')
      .select('*');
    
    // Apply order_id filter if specified
    if (filter.searchQuery) {
      // Search in order_info JSONB field
      query = query.or(`order_info->>cakeDesign.ilike.%${filter.searchQuery}%,order_info->>customerName.ilike.%${filter.searchQuery}%`);
    }
    
    // Apply date range filter
    if (filter.dateRange?.from) {
      query = query.gte('created_at', filter.dateRange.from.toISOString());
    }
    if (filter.dateRange?.to) {
      query = query.lte('created_at', filter.dateRange.to.toISOString());
    }
    
    // Apply shapes filter
    if (filter.shapes && filter.shapes.length > 0) {
      const shapeFilters = filter.shapes.map(shape => `order_info->>cakeShape.eq.${shape}`);
      query = query.or(shapeFilters.join(','));
    }
    
    // Apply flavors filter
    if (filter.flavors && filter.flavors.length > 0) {
      const flavorFilters = filter.flavors.map(flavor => `order_info->>cakeFlavor.eq.${flavor}`);
      query = query.or(flavorFilters.join(','));
    }
    
    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    let photos = data.map(this.mapToGalleryPhoto);
    
    // Apply tags filter (needs separate filtering due to many-to-many relationship)
    if (filter.tags && filter.tags.length > 0) {
      const photosWithTags = await Promise.all(
        photos.map(async (photo) => {
          const tags = await this.getPhotoTags(photo.id);
          return { ...photo, tags };
        })
      );
      
      photos = photosWithTags.filter(photo => 
        filter.tags.some(tag => photo.tags.includes(tag))
      );
    } else {
      // Get tags for all photos
      photos = await Promise.all(
        photos.map(async (photo) => {
          const tags = await this.getPhotoTags(photo.id);
          return { ...photo, tags };
        })
      );
    }
    
    return photos;
  }

  async getPhotoDetail(photoId: string): Promise<GalleryPhoto | undefined> {
    const photo = await this.getById(photoId);
    
    if (photo) {
      // Increment view count
      await supabase.rpc('increment_photo_view_count', { photo_id: photoId });
    }
    
    return photo;
  }

  async getRelatedPhotos(photoId: string, limit: number = 4): Promise<GalleryPhoto[]> {
    const photo = await this.getById(photoId);
    if (!photo) return [];
    
    const tags = await this.getPhotoTags(photoId);
    
    if (tags.length === 0) {
      // If no tags, just return recent photos from same order characteristics
      let query = supabase
        .from('gallery_photos')
        .select('*')
        .neq('id', photoId)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (photo.orderInfo?.cakeShape) {
        query = query.eq('order_info->>cakeShape', photo.orderInfo.cakeShape);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const relatedPhotos = await Promise.all(
        data.map(async (item) => {
          const itemTags = await this.getPhotoTags(item.id);
          return { ...this.mapToGalleryPhoto(item), tags: itemTags };
        })
      );
      
      return relatedPhotos;
    }
    
    // Find photos with similar tags
    const { data: photoTagsData, error: tagsError } = await supabase
      .from('photo_tags')
      .select('photo_id')
      .in('tag_value', tags)
      .neq('photo_id', photoId);
      
    if (tagsError) throw tagsError;
    
    const relatedPhotoIds = [...new Set(photoTagsData.map(pt => pt.photo_id))].slice(0, limit);
    
    if (relatedPhotoIds.length === 0) return [];
    
    const { data: photosData, error: photosError } = await supabase
      .from('gallery_photos')
      .select('*')
      .in('id', relatedPhotoIds)
      .order('created_at', { ascending: false });
      
    if (photosError) throw photosError;
    
    const relatedPhotos = await Promise.all(
      photosData.map(async (item) => {
        const itemTags = await this.getPhotoTags(item.id);
        return { ...this.mapToGalleryPhoto(item), tags: itemTags };
      })
    );
    
    return relatedPhotos;
  }

  async getAllTags(): Promise<CustomTag[]> {
    // Get custom tags
    const { data: customTagsData, error: customError } = await supabase
      .from('custom_tags')
      .select('*')
      .order('created_at', { ascending: true });
      
    if (customError) throw customError;
    
    // Get all photo tags to count usage
    const { data: allTagsData, error: countsError } = await supabase
      .from('photo_tags')
      .select('tag_value');
      
    if (countsError) throw countsError;
    
    // Count tag occurrences
    const tagCounts: Record<string, number> = {};
    allTagsData.forEach(item => {
      tagCounts[item.tag_value] = (tagCounts[item.tag_value] || 0) + 1;
    });
    
    // Built-in tags
    const builtInTags: CustomTag[] = [
      'for-kids', 'for-man', 'for-woman', 'birthday',
      'anniversary', 'wedding', 'other'
    ].map(tag => ({
      id: `builtin-${tag}`,
      value: tag,
      label: tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      count: tagCounts[tag] || 0,
      createdAt: new Date(0)
    }));
    
    // Custom tags
    const customTags: CustomTag[] = customTagsData.map(tag => ({
      id: tag.id,
      value: tag.value,
      label: tag.label,
      count: tagCounts[tag.value] || 0,
      createdAt: new Date(tag.created_at)
    }));
    
    return [...builtInTags, ...customTags];
  }

  async createCustomTag(label: string): Promise<CustomTag> {
    const value = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if tag already exists
    const { data: existingTag } = await supabase
      .from('custom_tags')
      .select('*')
      .eq('value', value)
      .single();
      
    if (existingTag) {
      return {
        id: existingTag.id,
        value: existingTag.value,
        label: existingTag.label,
        count: 0, // We could get the actual count here if needed
        createdAt: new Date(existingTag.created_at)
      };
    }
    
    const { data, error } = await supabase
      .from('custom_tags')
      .insert({
        value,
        label
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.id,
      value: data.value,
      label: data.label,
      count: 0,
      createdAt: new Date(data.created_at)
    };
  }

  async addPhotoFromOrder(order: Order, imageUrl: string, tags: OrderTag[]): Promise<GalleryPhoto> {
    const photoData: Omit<GalleryPhoto, 'id'> = {
      imageUrl,
      orderId: order.id,
      orderInfo: {
        cakeShape: order.cakeShape,
        cakeSize: order.cakeSize,
        cakeFlavor: order.cakeFlavor,
        cakeDesign: order.cakeDesign,
        customerName: order.customer?.name
      },
      tags,
      createdAt: new Date()
    };
    
    return await this.create(photoData);
  }

  private async getPhotoTags(photoId: string): Promise<OrderTag[]> {
    const { data, error } = await supabase
      .from('photo_tags')
      .select('tag_value')
      .eq('photo_id', photoId);
      
    if (error) throw error;
    
    return data.map(item => item.tag_value as OrderTag);
  }

  private async insertPhotoTags(photoId: string, tags: OrderTag[]): Promise<void> {
    const tagData = tags.map(tag => ({
      photo_id: photoId,
      tag_type: 'order_tag',
      tag_value: tag
    }));
    
    const { error } = await supabase
      .from('photo_tags')
      .insert(tagData);
      
    if (error) throw error;
  }

  private mapToGalleryPhoto(data: any): GalleryPhoto {
    return {
      id: data.id,
      imageUrl: data.image_url,
      orderId: data.order_id,
      orderInfo: data.order_info,
      tags: [], // Tags will be loaded separately when needed
      createdAt: new Date(data.created_at)
    };
  }
}