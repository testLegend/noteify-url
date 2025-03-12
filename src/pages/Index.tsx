
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WebScraperService } from '@/services/WebScraperService';
import { GeminiService } from '@/services/GeminiService';
import { AuthService } from '@/services/AuthService';
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  BookOpen, 
  FileDown, 
  Shield, 
  Image, 
  Sparkles,
  LogIn
} from "lucide-react";
import UrlInput from '@/components/UrlInput';
import NoteDisplay from '@/components/NoteDisplay';
import Header from '@/components/Header';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(!GeminiService.getApiKey());
  const [showPremiumUpgrade, setShowPremiumUpgrade] = useState(false);
  const [showLandingContent, setShowLandingContent] = useState(true);
  const [isLoginPromptVisible, setIsLoginPromptVisible] = useState(false);
  const user = AuthService.getCurrentUser();
  
  // Hide landing content when notes are displayed
  useEffect(() => {
    if (noteContent) {
      setShowLandingContent(false);
    }
  }, [noteContent]);
  
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
    // Check if user is logged in
    if (!user) {
      setIsLoginPromptVisible(true);
      toast({
        title: "Login required",
        description: "You need to log in to generate notes",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user can create notes
    if (!AuthService.canCreateNote()) {
      setShowPremiumUpgrade(true);
      toast({
        title: "Note limit reached",
        description: "You've reached your free note limit. Upgrade to premium for unlimited notes!",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setShowPremiumUpgrade(false);
    
    try {
      console.log('Fetching content from URL:', url);
      const content = await WebScraperService.scrapeWebsite(url);
      
      setNoteContent(content);
      setSourceUrl(url);
      
      // Increment note count
      AuthService.incrementNoteCount();
      
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
        {showApiInput && user && (
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
        
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-primary mb-3">Turn any website into readable notes</h1>
            <p className="text-lg text-muted-foreground">
              Noteify converts web content into well-organized, easy-to-read notes in seconds
            </p>
          </div>
          <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />
        </div>
        
        {isLoginPromptVisible && !user && (
          <div className="my-8 p-6 border border-primary/20 bg-primary/5 rounded-lg max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-3">Login Required</h2>
            <p className="mb-4 text-muted-foreground">
              You need to log in or create an account to generate notes.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/login')} className="gap-2">
                <LogIn className="h-4 w-4" /> Log In
              </Button>
              <Button onClick={() => navigate('/register')} variant="outline">
                Create Account
              </Button>
            </div>
          </div>
        )}
        
        {showPremiumUpgrade && user && (
          <div className="flex justify-center my-8">
            <PremiumUpgrade />
          </div>
        )}
        
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
        
        {!isLoading && !noteContent && !showPremiumUpgrade && showLandingContent && (
          <div className="max-w-5xl mx-auto mt-12">
            {/* How it works section */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-center mb-10">How Noteify Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Image className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">1. Paste URL</h3>
                      <p className="text-muted-foreground">
                        Enter the URL of any article, blog post, or documentation page you want to convert
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">2. AI Processing</h3>
                      <p className="text-muted-foreground">
                        Our AI analyzes the content and extracts the most important information
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">3. Get Notes</h3>
                      <p className="text-muted-foreground">
                        Receive well-formatted, easy-to-read notes that you can download or save
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            {/* Features section */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-center mb-10">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Privacy First</h3>
                    <p className="text-muted-foreground">
                      We don't store the content of the websites you process. Your data stays private.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <FileDown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Export as PDF</h3>
                    <p className="text-muted-foreground">
                      Download your notes as a PDF file for easy sharing or offline reference.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Fast Processing</h3>
                    <p className="text-muted-foreground">
                      Get your notes in seconds, no matter how complex the content.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">AI-Powered</h3>
                    <p className="text-muted-foreground">
                      Utilizes advanced AI to focus on what's important and create clear, concise notes.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Usage examples section */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-center mb-6">Perfect For</h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Research articles
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Blog posts
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    News articles
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Documentation
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Educational content
                  </li>
                  <li className="flex items-center text-slate-700">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Technical guides
                  </li>
                </ul>
              </div>
            </section>
            
            {/* CTA section */}
            <section className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Ready to simplify your reading?</h2>
                <p className="mb-6 max-w-md mx-auto">
                  Try Noteify now and transform complex web content into clear, organized notes.
                </p>
                <Button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  Get Started Now
                </Button>
              </div>
            </section>
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
