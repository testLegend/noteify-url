
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wand2 } from "lucide-react";
import { GeminiService } from '@/services/GeminiService';
import { useToast } from "@/hooks/use-toast";

interface CustomizeNoteDialogProps {
  content: string;
  sourceUrl: string;
  onNoteUpdate: (newContent: string) => void;
}

const CustomizeNoteDialog: React.FC<CustomizeNoteDialogProps> = ({
  content,
  sourceUrl,
  onNoteUpdate
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!customPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter your customization instructions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newContent = await GeminiService.customizeNotes(content, sourceUrl, customPrompt);
      onNoteUpdate(newContent);
      
      toast({
        title: "Success",
        description: "Your notes have been customized successfully",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error customizing notes:', error);
      
      toast({
        title: "Error",
        description: "Failed to customize notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Customize Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Customize Your Notes</DialogTitle>
          <DialogDescription>
            Tell us how you'd like to customize your notes. For example, "Make it more concise",
            "Focus on technical details", or "Format as a study guide with questions".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Enter your customization instructions..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center">
                <span className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            ) : (
              <span className="flex items-center">
                <Wand2 className="mr-2 h-4 w-4" /> Apply Customization
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeNoteDialog;
