
import { useState } from 'react';
import { WebScraperService } from '@/services/WebScraperService';
import { GeminiService } from '@/services/GeminiService';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UrlInput from '@/components/UrlInput';
import NoteDisplay from '@/components/NoteDisplay';
import Header from '@/components/Header';

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(!GeminiService.getApiKey());
  
  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    GeminiService.saveApiKey(apiKey.trim());
    setShowApiInput(false);
    
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
  };

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
        {showApiInput && (
          <div className="mb-8 p-4 border border-amber-200 bg-amber-50 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-2">Gemini API Key Required</h2>
            <p className="text-sm text-muted-foreground mb-4">
              To enable AI-powered note generation, please enter your Gemini API key.
              You can get a free API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="flex-grow"
              />
              <Button onClick={handleApiKeySave}>Save Key</Button>
            </div>
          </div>
        )}
        
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
