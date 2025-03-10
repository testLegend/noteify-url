
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon, ArrowRight } from "lucide-react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    // Add https:// if protocol is missing
    let processedUrl = url.trim();
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
    }
    
    try {
      new URL(processedUrl);
      setError('');
      onSubmit(processedUrl);
    } catch (err) {
      setError('Please enter a valid URL');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            className={`h-12 pr-12 text-base ${error ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        <Button 
          type="submit" 
          className="h-12 px-6"
          disabled={isLoading}
        >
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
              Convert to Notes <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default UrlInput;
