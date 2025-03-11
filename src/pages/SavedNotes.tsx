
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Eye, Trash2 } from "lucide-react";
import { PdfExporter } from '@/utils/PdfExporter';
import { toast } from "@/hooks/use-toast";
import NoteDisplay from '@/components/NoteDisplay';

const SavedNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userNotes = AuthService.getUserSavedNotes();
    setNotes(userNotes);
  }, [navigate]);
  
  const handleDeleteNote = (noteId: string) => {
    const deleted = AuthService.deleteNote(noteId);
    if (deleted) {
      toast({
        title: "Note deleted",
        description: "The note has been successfully deleted",
      });
      
      // Update notes list
      setNotes(notes.filter(note => note.id !== noteId));
      
      // Clear selected note if it was the one deleted
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to delete the note",
        variant: "destructive",
      });
    }
  };
  
  const handleExportPdf = async (note: any) => {
    try {
      // Create a temporary div with note content
      const tempDiv = document.createElement('div');
      tempDiv.id = `temp-note-${note.id}`;
      tempDiv.className = 'hidden';
      tempDiv.innerHTML = note.content;
      document.body.appendChild(tempDiv);
      
      // Generate filename
      const domain = new URL(note.sourceUrl).hostname.replace('www.', '');
      const filename = `notes-${domain}-${note.id.substring(0, 6)}.pdf`;
      
      await PdfExporter.exportToPdf(`temp-note-${note.id}`, filename);
      
      // Remove temporary div
      document.body.removeChild(tempDiv);
      
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };
  
  if (selectedNote) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="container px-4 flex-1 mx-auto">
          <div className="my-4">
            <Button 
              variant="outline" 
              className="mb-4" 
              onClick={() => setSelectedNote(null)}
            >
              ← Back to all notes
            </Button>
            <NoteDisplay content={selectedNote.content} sourceUrl={selectedNote.sourceUrl} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container px-4 flex-1 mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Saved Notes</h1>
        
        {notes.length === 0 ? (
          <div className="bg-muted/50 border rounded-lg p-8 text-center">
            <h2 className="text-xl font-medium mb-2">No saved notes yet</h2>
            <p className="text-muted-foreground mb-4">
              When you save notes, they will appear here for easy access.
            </p>
            <Button onClick={() => navigate('/')}>Create New Notes</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <Card key={note.id} className="overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="truncate text-lg">{note.title || 'Untitled Note'}</CardTitle>
                  <CardDescription>{formatDate(note.createdAt)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="line-clamp-4 text-sm text-muted-foreground">
                    <div dangerouslySetInnerHTML={{ __html: note.content.substring(0, 200) + '...' }} />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3 flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => setSelectedNote(note)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:inline-block">View</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1"
                      onClick={() => handleExportPdf(note)}
                    >
                      <FileDown className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:inline-block">Download</span>
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive border-destructive/20 hover:border-destructive gap-1"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only md:not-sr-only md:inline-block">Delete</span>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SavedNotes;
