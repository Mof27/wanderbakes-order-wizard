
import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface CakePhotoUploaderProps {
  orderId: string;
}

const CakePhotoUploader = ({ orderId }: CakePhotoUploaderProps) => {
  const { orders, getOrderById, updateOrder } = useApp();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const order = getOrderById(orderId);
  
  if (!order) {
    return <div>Order not found</div>;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!previewImage) {
      toast.error('Please upload a cake photo first');
      return;
    }

    setUploading(true);
    
    try {
      // In a real app, we would upload the image to storage here
      // For now, we'll simulate the upload and just update the status
      
      // Update the order with the new status and "image URL"
      await updateOrder({
        ...order,
        status: 'ready', // Change status to ready after photo upload
        attachments: [...(order.attachments || []), previewImage],
      });
      
      toast.success('Cake photo uploaded successfully!');
      clearPreview();
    } catch (error) {
      console.error('Failed to upload cake photo:', error);
      toast.error('Failed to upload cake photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <Input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {previewImage ? (
        <div className="relative">
          <img 
            src={previewImage} 
            alt="Cake preview" 
            className="w-full h-48 object-cover rounded-md"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 bg-white/80 hover:bg-white"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full h-16 border-dashed flex flex-col gap-1"
          onClick={handleUploadClick}
        >
          <Camera className="h-4 w-4" />
          <span>Upload Cake Photo</span>
        </Button>
      )}
      
      {previewImage && (
        <Button 
          className="w-full bg-cake-primary hover:bg-cake-primary/80 text-cake-text" 
          onClick={handleSubmit}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Submit Photo For Approval'}
        </Button>
      )}
    </div>
  );
};

export default CakePhotoUploader;
