
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
}

const NotesSection = ({ 
  notes, 
  handleInputChange, 
  readOnly = false,
  label = "Order Notes",
  placeholder = "Additional notes about this order"
}: NotesSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">{label}</Label>
      <Textarea
        id="notes"
        name="notes"
        value={notes}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="min-h-[80px]"
        disabled={readOnly}
      />
    </div>
  );
};

export default NotesSection;
