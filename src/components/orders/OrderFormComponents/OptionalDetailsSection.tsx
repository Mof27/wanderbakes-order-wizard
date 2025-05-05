
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
  readOnly?: boolean;
}

const OptionalDetailsSection = ({
  formData,
  handleInputChange,
  imagePreview,
  handleFileChange,
  readOnly = false
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
                disabled={readOnly}
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
                disabled={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label>Design Attachment</Label>
        <div className={`border-2 border-dashed rounded-md p-4 text-center ${!readOnly ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}`}>
          <input 
            type="file" 
            id="fileUpload" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={readOnly}
          />
          <label htmlFor="fileUpload" className={readOnly ? "" : "cursor-pointer"}>
            <div className="flex flex-col items-center">
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-md" />
                  {!readOnly && <p className="text-sm text-muted-foreground">Click to change image</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <FileImage className="h-10 w-10 text-muted-foreground mx-auto" />
                  {!readOnly ? (
                    <>
                      <p className="text-sm font-medium">Upload design image</p>
                      <p className="text-xs text-muted-foreground">Click to upload JPG, PNG</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No image attached</p>
                  )}
                </div>
              )}
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default OptionalDetailsSection;
