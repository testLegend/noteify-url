
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AuthService } from '@/services/AuthService';
import { ElevenLabsService } from '@/services/ElevenLabsService';
import { toast } from "@/hooks/use-toast";
import { AudioWaveform, Play, Pause, Volume2, VolumeX, Save, RotateCcw, Crown } from "lucide-react";

interface AudioSummaryProps {
  content: string;
}

const AudioSummary: React.FC<AudioSummaryProps> = ({ content }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const user = AuthService.getCurrentUser();
  const isPremiumUser = user?.isPremium || false;
  
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleAudioEnded = () => {
    setIsPlaying(false);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };
  
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };
  
  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    ElevenLabsService.saveApiKey(apiKey.trim());
    setShowApiKeyDialog(false);
    
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
    
    handleGenerateAudio();
  };
  
  const handleGenerateAudio = async () => {
    if (!content) {
      toast({
        title: "Error",
        description: "No content to generate audio from",
        variant: "destructive",
      });
      return;
    }
    
    // Since we've added a free alternative, we don't need to force API key entry
    // but still allow premium users to add their key for better quality
    const apiKey = ElevenLabsService.getApiKey();
    if (isPremiumUser && !apiKey) {
      setShowApiKeyDialog(true);
      return;
    }
    
    try {
      setIsGenerating(true);
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      
      const audioBlob = await ElevenLabsService.generateAudio(content);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      toast({
        title: "Audio generated",
        description: "Your audio summary is ready to play",
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Error",
        description: "Failed to generate audio summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const resetAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsPlaying(false);
    }
  };
  
  const saveAudio = () => {
    if (!audioUrl) return;
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = 'note-audio-summary.mp3';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Audio saved",
      description: "The audio file has been saved to your device",
    });
  };
  
  return (
    <>
      <div className="mt-6 border rounded-lg p-4 bg-gray-50">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium flex items-center">
              <AudioWaveform className="h-5 w-5 mr-2 text-primary" />
              Audio Summary
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGenerateAudio}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : (audioUrl ? "Regenerate" : "Generate Audio")}
            </Button>
          </div>
          
          {audioUrl && (
            <div className="space-y-3">
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={handleAudioEnded}
                hidden
              />
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  className="h-9 w-9"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="flex items-center flex-1 mx-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-8 w-8 mr-2"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="h-2"
                  />
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetAudio}
                    className="h-8 w-8"
                    title="Reset audio"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={saveAudio}
                    className="h-8 w-8"
                    title="Download audio"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Audio generated using browser's speech synthesis technology.
              </p>
            </div>
          )}
          
          {!audioUrl && !isGenerating && (
            <p className="text-sm text-muted-foreground">
              Generate an audio summary of your notes to listen on-the-go.
            </p>
          )}
          
          {isGenerating && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-pulse flex space-x-1">
                <div className="h-3 w-1 bg-primary rounded"></div>
                <div className="h-6 w-1 bg-primary rounded"></div>
                <div className="h-4 w-1 bg-primary rounded"></div>
                <div className="h-8 w-1 bg-primary rounded"></div>
                <div className="h-5 w-1 bg-primary rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ElevenLabs API Key (Optional)</DialogTitle>
            <DialogDescription>
              For premium quality voice, you can enter your ElevenLabs API key. 
              You can get a free API key from <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ElevenLabs</a>.
              
              <p className="mt-2">Or click Cancel to use the free built-in browser speech synthesis.</p>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your ElevenLabs API key"
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowApiKeyDialog(false);
              handleGenerateAudio();
            }}>
              Use Free Version
            </Button>
            <Button onClick={handleSaveApiKey}>
              Save Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AudioSummary;
