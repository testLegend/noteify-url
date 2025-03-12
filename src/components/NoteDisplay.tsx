
import { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileDown, Save } from "lucide-react";
import { PdfExporter } from '@/utils/PdfExporter';
import parse from 'html-react-parser';
import { AuthService } from '@/services/AuthService';
import { toast } from "@/hooks/use-toast";
import CustomizeNoteDialog from './CustomizeNoteDialog';

interface NoteDisplayProps {
  content: string;
  sourceUrl: string;
}

const NoteDisplay: React.FC<NoteDisplayProps> = ({ content, sourceUrl }) => {
  const noteRef = useRef<HTMLDivElement>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [noteContent, setNoteContent] = useState(content);
  const user = AuthService.getCurrentUser();
  const isPremiumUser = user?.isPremium || false;
  
  const handleExportPdf = async () => {
    try {
      if (!noteRef.current) return;
      
      // Get domain for filename
      const domain = new URL(sourceUrl).hostname.replace('www.', '');
      const filename = `notes-${domain}.pdf`;
      
      await PdfExporter.exportToPdf('note-content', filename);
      toast({
        title: "PDF exported",
        description: "Your note has been successfully exported as PDF",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to export note as PDF",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveNote = () => {
    if (!noteContent || !sourceUrl) {
      toast({
        title: "Error",
        description: "No content to save",
        variant: "destructive",
      });
      return;
    }
    
    // Extract a title from the content (first heading or first few words)
    let title = "Untitled Note";
    const headingMatch = noteContent.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    
    if (headingMatch && headingMatch[1]) {
      // Strip any HTML tags from the heading
      title = headingMatch[1].replace(/<\/?[^>]+(>|$)/g, "");
    } else {
      // Use the first few words of the content as title
      const textContent = noteContent.replace(/<\/?[^>]+(>|$)/g, " ").trim();
      title = textContent.split(' ').slice(0, 5).join(' ') + (textContent.length > 30 ? '...' : '');
    }
    
    const note = AuthService.saveNote(noteContent, sourceUrl, title);
    
    if (note) {
      setIsSaved(true);
      toast({
        title: "Note saved",
        description: "Your note has been saved to your account",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    }
  };
  
  const handleNoteUpdate = (newContent: string) => {
    setNoteContent(newContent);
    setIsSaved(false); // Reset saved state since content has changed
  };
  
  if (!noteContent) return null;
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Notes</h2>
        <div className="flex gap-2">
          {isPremiumUser && (
            <CustomizeNoteDialog 
              content={noteContent} 
              sourceUrl={sourceUrl} 
              onNoteUpdate={handleNoteUpdate} 
            />
          )}
          <Button 
            variant="outline" 
            onClick={handleSaveNote}
            className="flex items-center gap-2"
            disabled={isSaved}
          >
            <Save className="h-4 w-4" />
            {isSaved ? "Saved" : "Save to Account"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPdf}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-6 pt-8" ref={noteRef}>
          <div id="note-content" className="note-content prose prose-slate prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4 prose-p:my-3 prose-li:my-1 prose-blockquote:bg-blue-50 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:my-4 prose-blockquote:rounded-r prose-strong:text-blue-800 prose-hr:my-6 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm max-w-none">
            {parse(noteContent)}
          </div>
          
          <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
            <p>Source: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{sourceUrl}</a></p>
            <p className="mt-1">Notes generated with AI assistance</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteDisplay;
