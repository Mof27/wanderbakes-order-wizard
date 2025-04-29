
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const NotesSection = ({ notes, handleInputChange }: NotesSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Order Notes</Label>
      <Textarea
        id="notes"
        name="notes"
        value={notes}
        onChange={handleInputChange}
        placeholder="Additional notes about this order"
        className="min-h-[80px]"
      />
    </div>
  );
};

export default NotesSection;
