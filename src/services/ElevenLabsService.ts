
// Text-to-speech service with free API fallback
export class ElevenLabsService {
  private static API_KEY_STORAGE_KEY = 'elevenlabs_api_key';

  // Save the API key to local storage
  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('API key saved successfully');
  }

  // Get the API key from local storage
  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  // Generate audio from text
  static async generateAudio(text: string): Promise<Blob> {
    try {
      const apiKey = this.getApiKey();
      
      // Prepare the text for conversion - create a summary if the text is too long
      const processedText = this.prepareTextForConversion(text);
      
      // If API key exists, try to use ElevenLabs
      if (apiKey) {
        try {
          return await this.useElevenLabsAPI(processedText, apiKey);
        } catch (error) {
          console.error('Error with ElevenLabs API, falling back to free API:', error);
          // Fall back to free API
        }
      }
      
      // Use free API (Web Speech API)
      return await this.useFreeTTS(processedText);
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }
  
  // Use ElevenLabs API for premium quality
  private static async useElevenLabsAPI(text: string, apiKey: string): Promise<Blob> {
    // Using voice ID for "Sarah" which is a high-quality natural female voice
    const voiceId = "EXAVITQu4vr4xnSDxMaL";
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2", // High quality multilingual model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorData}`);
    }
    
    return await response.blob();
  }
  
  // Use Web Speech API (free browser-based TTS)
  private static useFreeTTS(text: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Check if SpeechSynthesis is available
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported in this browser'));
        return;
      }
      
      // Create an audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const chunks: Float32Array[] = [];
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: BlobPart[] = [];
      
      // Set up speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(voice => 
        voice.lang.includes('en') && voice.localService === false
      );
      
      if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
      }
      
      // Configure utterance
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Set up media recorder
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        resolve(audioBlob);
        
        // Clean up
        processor.disconnect();
        audioContext.close();
      };
      
      mediaRecorder.start();
      
      // Convert from SpeechSynthesis to MediaRecorder
      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        chunks.push(new Float32Array(channelData));
      };
      
      processor.connect(destination);
      
      // Start synthesis
      utterance.onend = () => {
        mediaRecorder.stop();
      };
      
      window.speechSynthesis.speak(utterance);
      
      // Fallback: If speech synthesis fails or doesn't trigger onend
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 30000); // 30-second timeout
    });
  }
  
  // Helper function to prepare text for conversion
  // Create a summary if the text is too long
  private static prepareTextForConversion(text: string): string {
    // Strip HTML tags and get plain text
    const plainText = this.stripHtmlTags(text);
    
    // If the text is relatively short, return it as is
    if (plainText.length < 5000) {
      return `Here's a summary of the notes: ${plainText.substring(0, 4500)}`;
    }
    
    // For longer text, create a summary
    // Extract first 1000 chars (likely contains the introduction)
    const introduction = plainText.substring(0, 1000);
    
    // Extract headings (usually important points)
    const headingMatches = text.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
    const headings = headingMatches
      .map(h => this.stripHtmlTags(h))
      .join(". ");
    
    // Construct the summary with intro and key points
    return `Here's a summary of the notes: ${introduction}... The key points covered are: ${headings}`;
  }

  // Helper method to strip HTML tags from text
  private static stripHtmlTags(html: string): string {
    // Create a temporary div element
    const tempDiv = document.createElement('div');
    
    // Set its HTML content
    tempDiv.innerHTML = html;
    
    // Get the text content (this removes all HTML tags)
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Return the plain text after trimming whitespace
    return plainText.replace(/\s+/g, ' ').trim();
  }
}
