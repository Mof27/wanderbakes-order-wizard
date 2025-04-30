
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomColor } from "@/types";
import { Upload } from "lucide-react";

interface CustomColorPickerProps {
  value: CustomColor;
  onChange: (value: CustomColor) => void;
}

const CustomColorPicker = ({ value, onChange }: CustomColorPickerProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    value.imageUrl || null
  );

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...value,
      notes: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImagePreview(imageUrl);
        onChange({
          ...value,
          imageUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="custom-color-notes">Custom Color Notes</Label>
        <Textarea
          id="custom-color-notes"
          value={value.notes}
          onChange={handleNotesChange}
          placeholder="Describe the custom color you want (e.g., pastel rainbow with gold accents)"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-color-image">Reference Image (Optional)</Label>
        <div className="flex items-center gap-4">
          <label 
            htmlFor="custom-color-image" 
            className="flex items-center gap-2 px-4 py-2 border border-input bg-background rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground"
          >
            <Upload size={18} /> Upload Image
          </label>
          <Input 
            type="file" 
            id="custom-color-image" 
            accept="image/*" 
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        {imagePreview && (
          <div className="mt-2">
            <img 
              src={imagePreview} 
              alt="Custom color reference" 
              className="max-h-[200px] rounded-md border border-border" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomColorPicker;
