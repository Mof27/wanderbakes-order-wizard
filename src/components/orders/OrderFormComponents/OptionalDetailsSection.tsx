
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FileImage } from "lucide-react";

interface OptionalDetailsSectionProps {
  formData: {
    cakeText: string;
    greetingCard: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  imagePreview: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OptionalDetailsSection = ({
  formData,
  handleInputChange,
  imagePreview,
  handleFileChange
}: OptionalDetailsSectionProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Optional Design Details</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cakeText">Cake Text</Label>
              <Input
                id="cakeText"
                name="cakeText"
                value={formData.cakeText}
                onChange={handleInputChange}
                placeholder="Text to be written on the cake"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="greetingCard">Greeting Card Message</Label>
              <Textarea
                id="greetingCard"
                name="greetingCard"
                value={formData.greetingCard}
                onChange={handleInputChange}
                placeholder="Message for the greeting card"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label>Design Attachment</Label>
        <div className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
          <input 
            type="file" 
            id="fileUpload" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
            {imagePreview ? (
              <div className="space-y-2">
                <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-md" />
                <p className="text-sm text-muted-foreground">Click to change image</p>
              </div>
            ) : (
              <div className="space-y-2">
                <FileImage className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium">Upload design image</p>
                <p className="text-xs text-muted-foreground">Click to upload JPG, PNG</p>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};

export default OptionalDetailsSection;
