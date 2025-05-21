import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GalleryRepository } from '../gallery.repository';
import { GalleryPhoto, CustomTag, GalleryFilter, GallerySort } from '@/types/gallery';
import { Order, OrderTag } from '@/types';

export class SupabaseGalleryRepository implements GalleryRepository {
  private client: SupabaseClient;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async getAll(): Promise<GalleryPhoto[]> {
    const { data, error } = await this.client
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return this.mapDbPhotosToGalleryPhotos(data || []);
  }

  async getById(id: string): Promise<GalleryPhoto | undefined> {
    const { data, error } = await this.client
      .from('gallery_photos')
      .select(`
        *,
        gallery_photo_tags (
          gallery_tags (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return undefined;
    
    return this.mapDbPhotoToGalleryPhoto(data);
  }

  async create(photo: Omit<GalleryPhoto, 'id' | 'createdAt'>): Promise<GalleryPhoto> {
    // Prepare photo data for database
    const photoData = {
      image_url: photo.imageUrl,
      order_id: photo.orderId,
      order_info: photo.orderInfo,
      created_at: new Date().toISOString(),
    };
    
    // Insert photo
    const { data: photoRecord, error } = await this.client
      .from('gallery_photos')
      .insert(photoData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Associate tags with photo
    if (photo.tags && photo.tags.length > 0) {
      // First, ensure all tags exist
      const tagPromises = photo.tags.map(tagValue => this.ensureTagExists(tagValue));
      const tagRecords = await Promise.all(tagPromises);
      
      // Then create the photo-tag associations
      const photoTagAssociations = tagRecords.map(tag => ({
        photo_id: photoRecord.id,
        tag_id: tag.id
      }));
      
      const { error: associationError } = await this.client
        .from('gallery_photo_tags')
        .insert(photoTagAssociations);
      
      if (associationError) throw associationError;
    }
    
    // Return the complete photo object
    return this.mapDbPhotoToGalleryPhoto({
      ...photoRecord,
      tags: photo.tags as OrderTag[]
    });
  }

  async update(id: string, photo: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
    const updateData: any = {};
    
    if (photo.imageUrl) updateData.image_url = photo.imageUrl;
    if (photo.orderInfo) updateData.order_info = photo.orderInfo;
    
    // Update photo record
    const { data: updatedPhoto, error } = await this.client
      .from('gallery_photos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // If tags were updated, handle tag associations
    if (photo.tags) {
      // First delete existing associations
      await this.client
        .from('gallery_photo_tags')
        .delete()
        .eq('photo_id', id);
      
      // Then ensure all tags exist
      const tagPromises = photo.tags.map(tagValue => this.ensureTagExists(tagValue));
      const tagRecords = await Promise.all(tagPromises);
      
      // Create new associations
      const photoTagAssociations = tagRecords.map(tag => ({
        photo_id: id,
        tag_id: tag.id
      }));
      
      if (photoTagAssociations.length > 0) {
        const { error: associationError } = await this.client
          .from('gallery_photo_tags')
          .insert(photoTagAssociations);
        
        if (associationError) throw associationError;
      }
    }
    
    // Get the complete updated record
    return this.getById(id) as Promise<GalleryPhoto>;
  }

  async delete(id: string): Promise<boolean> {
    // First delete photo-tag associations
    const { error: tagDeleteError } = await this.client
      .from('gallery_photo_tags')
      .delete()
      .eq('photo_id', id);
    
    if (tagDeleteError) throw tagDeleteError;
    
    // Then delete the photo from storage if needed
    try {
      const { data: photo } = await this.client
        .from('gallery_photos')
        .select('image_url')
        .eq('id', id)
        .single();
      
      if (photo && photo.image_url) {
        // Extract path from URL if it's a Supabase storage URL
        const url = new URL(photo.image_url);
        const path = url.pathname.split('/').slice(2).join('/');
        
        if (path) {
          await this.client.storage.from('cake-photos').remove([path]);
        }
      }
    } catch (error) {
      console.error('Failed to delete photo from storage:', error);
      // Continue with database deletion even if storage deletion fails
    }
    
    // Finally delete the photo record
    const { error } = await this.client
      .from('gallery_photos')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async getPhotosByFilter(filter: GalleryFilter, sort: GallerySort = 'newest'): Promise<GalleryPhoto[]> {
    let query = this.client
      .from('gallery_photos')
      .select(`
        *,
        gallery_photo_tags!inner (
          gallery_tags (*)
        )
      `);
    
    // Apply tag filter
    if (filter.tags && filter.tags.length > 0) {
      query = query.in('gallery_photo_tags.gallery_tags.value', filter.tags);
    }
    
    // Apply shape filter
    if (filter.shapes && filter.shapes.length > 0) {
      query = query.or(filter.shapes.map(shape => `order_info->>'cakeShape'.eq.${shape}`).join(','));
    }
    
    // Apply flavor filter
    if (filter.flavors && filter.flavors.length > 0) {
      query = query.or(filter.flavors.map(flavor => `order_info->>'cakeFlavor'.eq.${flavor}`).join(','));
    }
    
    // Apply date range filter
    if (filter.dateRange) {
      if (filter.dateRange.from) {
        query = query.gte('created_at', filter.dateRange.from.toISOString());
      }
      if (filter.dateRange.to) {
        query = query.lte('created_at', filter.dateRange.to.toISOString());
      }
    }
    
    // Apply search query
    if (filter.searchQuery) {
      const searchTerm = `%${filter.searchQuery.toLowerCase()}%`;
      query = query.or([
        `order_info->>'cakeDesign'.ilike.${searchTerm}`,
        `order_info->>'cakeShape'.ilike.${searchTerm}`,
        `order_info->>'cakeFlavor'.ilike.${searchTerm}`,
        `order_info->>'cakeSize'.ilike.${searchTerm}`,
        `order_info->>'customerName'.ilike.${searchTerm}`
      ].join(','));
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
        // This would require a more complex query or additional data
        // For now, we'll default to newest
        query = query.order('created_at', { ascending: false });
        break;
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return this.mapDbPhotosToGalleryPhotos(data || []);
  }

  async getPhotoDetail(photoId: string): Promise<GalleryPhoto | undefined> {
    return this.getById(photoId);
  }

  async getRelatedPhotos(photoId: string, limit: number = 4): Promise<GalleryPhoto[]> {
    // Get the tags for the source photo
    const { data: photoTags, error: tagError } = await this.client
      .from('gallery_photo_tags')
      .select('tag_id')
      .eq('photo_id', photoId);
    
    if (tagError) throw tagError;
    
    if (!photoTags || photoTags.length === 0) {
      // If no tags, return random photos
      const { data, error } = await this.client
        .from('gallery_photos')
        .select('*')
        .neq('id', photoId)
        .limit(limit);
      
      if (error) throw error;
      
      return this.mapDbPhotosToGalleryPhotos(data || []);
    }
    
    const tagIds = photoTags.map(pt => pt.tag_id);
    
    // Find photos that share tags with the source photo
    const { data, error } = await this.client
      .from('gallery_photo_tags')
      .select(`
        gallery_photos!inner (*),
        tag_id
      `)
      .in('tag_id', tagIds)
      .neq('gallery_photos.id', photoId)
      .order('gallery_photos.created_at', { ascending: false })
      .limit(limit * 2); // Get more than needed to allow for deduplication
    
    if (error) throw error;
    
    // Group by photo and count matching tags for scoring
    const photoMap = new Map();
    if (data && data.length > 0) {
      for (const item of data) {
        // Check if item.gallery_photos exists and has an id property
        if (item && item.gallery_photos && typeof item.gallery_photos === 'object' && 'id' in item.gallery_photos) {
          const photoId = item.gallery_photos.id;
          if (!photoMap.has(photoId)) {
            photoMap.set(photoId, {
              photo: item.gallery_photos,
              score: 1
            });
          } else {
            const entry = photoMap.get(photoId);
            entry.score += 1;
          }
        }
      }
    }
    
    // Sort by score and limit
    const relatedPhotos = Array.from(photoMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(entry => this.mapDbPhotoToGalleryPhoto(entry.photo));
    
    return relatedPhotos;
  }

  async getAllTags(): Promise<CustomTag[]> {
    // Get all tags with counts
    const { data, error } = await this.client.rpc('get_tags_with_counts');
    
    if (error) throw error;
    
    return (data || []).map((tag: any) => ({
      id: tag.id,
      value: tag.value,
      label: tag.label || this.formatTagLabel(tag.value),
      count: tag.count || 0,
      createdAt: new Date(tag.created_at)
    }));
  }

  async createCustomTag(label: string): Promise<CustomTag> {
    // Convert label to a valid tag value (lowercase-with-dashes)
    const value = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check if tag already exists
    const { data: existingTag, error: lookupError } = await this.client
      .from('gallery_tags')
      .select('*')
      .eq('value', value)
      .maybeSingle();
    
    if (lookupError) throw lookupError;
    
    if (existingTag) {
      return {
        id: existingTag.id,
        value: existingTag.value,
        label: existingTag.label || this.formatTagLabel(existingTag.value),
        count: 0,
        createdAt: new Date(existingTag.created_at)
      };
    }
    
    // Create new tag
    const { data: newTag, error } = await this.client
      .from('gallery_tags')
      .insert({ value, label, created_at: new Date().toISOString() })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: newTag.id,
      value: newTag.value,
      label: newTag.label,
      count: 0,
      createdAt: new Date(newTag.created_at)
    };
  }

  async addPhoto(photo: Omit<GalleryPhoto, 'id' | 'orderId' | 'createdAt'>): Promise<GalleryPhoto> {
    // Generate a placeholder orderId for standalone photos
    const orderId = `standalone-${Date.now()}`;
    
    // Create the photo with required fields
    const newPhoto: Omit<GalleryPhoto, 'id'> = {
      ...photo,
      orderId,
      createdAt: new Date()
    };
    
    // Use the existing create method to add to collection
    return this.create(newPhoto);
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
  
  // Helper method to upload an image to Supabase Storage
  async uploadImage(file: File): Promise<string> {
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const path = `cake-photos/${filename}`;
    
    const { data, error } = await this.client.storage
      .from('cake-photos')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get the public URL of the uploaded file
    const { data: urlData } = this.client.storage
      .from('cake-photos')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  }

  // Helper method to ensure a tag exists or create it
  private async ensureTagExists(tagValue: string): Promise<{ id: string, value: string }> {
    const { data: existingTag, error } = await this.client
      .from('gallery_tags')
      .select('*')
      .eq('value', tagValue)
      .maybeSingle();
    
    if (error) throw error;
    
    if (existingTag) return existingTag;
    
    // Tag doesn't exist, create it
    const { data: newTag, error: createError } = await this.client
      .from('gallery_tags')
      .insert({
        value: tagValue,
        label: this.formatTagLabel(tagValue),
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    return newTag;
  }

  // Helper to format a tag value into a label
  private formatTagLabel(value: string): string {
    return value.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Helper to map database records to GalleryPhoto objects
  private mapDbPhotoToGalleryPhoto(dbPhoto: any): GalleryPhoto {
    let tags: OrderTag[] = [];
    
    // Extract tags if available in the query result
    if (dbPhoto.gallery_photo_tags) {
      const tagsList = Array.isArray(dbPhoto.gallery_photo_tags) 
        ? dbPhoto.gallery_photo_tags 
        : [dbPhoto.gallery_photo_tags];
        
      tags = tagsList
        .filter(pt => pt && pt.gallery_tags)
        .map(pt => pt.gallery_tags.value as OrderTag);
    }
    
    return {
      id: dbPhoto.id,
      imageUrl: dbPhoto.image_url,
      orderId: dbPhoto.order_id,
      orderInfo: dbPhoto.order_info,
      tags: tags.length > 0 ? tags : (dbPhoto.tags || []),
      createdAt: new Date(dbPhoto.created_at)
    };
  }

  // Helper to map multiple database records to GalleryPhoto objects
  private mapDbPhotosToGalleryPhotos(dbPhotos: any[]): GalleryPhoto[] {
    return dbPhotos.map(photo => this.mapDbPhotoToGalleryPhoto(photo));
  }
}
