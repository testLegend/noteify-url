
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { PdfExporter } from '@/utils/PdfExporter';
import parse from 'html-react-parser';

interface NoteDisplayProps {
  content: string;
  sourceUrl: string;
}

const NoteDisplay: React.FC<NoteDisplayProps> = ({ content, sourceUrl }) => {
  const noteRef = useRef<HTMLDivElement>(null);
  
  const handleExportPdf = async () => {
    try {
      if (!noteRef.current) return;
      
      // Get domain for filename
      const domain = new URL(sourceUrl).hostname.replace('www.', '');
      const filename = `notes-${domain}.pdf`;
      
      await PdfExporter.exportToPdf('note-content', filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      // In a production app, we would show a toast notification here
      alert('Failed to export PDF. Please try again.');
    }
  };
  
  if (!content) return null;
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Notes</h2>
        <Button 
          variant="outline" 
          onClick={handleExportPdf}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Download PDF
        </Button>
      </div>
      
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-6" ref={noteRef}>
          <div id="note-content" className="note-content">
            {parse(content)}
          </div>
          
          <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
            <p>Source: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{sourceUrl}</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteDisplay;
