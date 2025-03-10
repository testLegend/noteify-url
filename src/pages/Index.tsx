
import { useState } from 'react';
import { WebScraperService } from '@/services/WebScraperService';
import { useToast } from "@/components/ui/use-toast";
import UrlInput from '@/components/UrlInput';
import NoteDisplay from '@/components/NoteDisplay';
import Header from '@/components/Header';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    
    try {
      console.log('Fetching content from URL:', url);
      const content = await WebScraperService.scrapeWebsite(url);
      
      setNoteContent(content);
      setSourceUrl(url);
      
      toast({
        title: "Notes created!",
        description: "The website content has been converted to notes.",
      });
    } catch (error) {
      console.error('Error processing URL:', error);
      
      toast({
        title: "Error",
        description: "Failed to convert the website. Please try another URL.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container px-4 py-8">
        <div className="mb-12">
          <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
        </div>
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block rounded-full h-16 w-16 bg-primary/10 p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="mt-4 text-muted-foreground">Converting website to notes...</p>
          </div>
        )}
        
        {!isLoading && noteContent && (
          <NoteDisplay content={noteContent} sourceUrl={sourceUrl} />
        )}
        
        {!isLoading && !noteContent && (
          <div className="text-center py-12 max-w-md mx-auto">
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Enter a website URL above to convert its content into readable notes.
              </p>
              <p className="text-sm text-muted-foreground">
                Works best with article pages, blog posts, and documentation.
              </p>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2023 Noteify - Convert websites to beautiful notes</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
