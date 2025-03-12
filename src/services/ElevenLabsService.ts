
// ElevenLabs API service for text-to-speech conversion
export class ElevenLabsService {
  private static API_KEY_STORAGE_KEY = 'elevenlabs_api_key';

  // Save the API key to local storage
  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('ElevenLabs API key saved successfully');
  }

  // Get the API key from local storage
  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  // Generate audio from text
  static async generateAudio(text: string): Promise<Blob> {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        throw new Error('ElevenLabs API key not found');
      }
      
      // Prepare the text for conversion - create a summary if the text is too long
      const processedText = this.prepareTextForConversion(text);
      
      // Using voice ID for "Sarah" which is a high-quality natural female voice
      const voiceId = "EXAVITQu4vr4xnSDxMaL"; 
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: processedText,
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
      
      // Return the audio as a blob
      return await response.blob();
    } catch (error) {
      console.error('Error generating audio with ElevenLabs:', error);
      throw error;
    }
  }
  
  // Helper function to prepare text for conversion
  // ElevenLabs has character limits, so we need to create a summary if the text is too long
  private static prepareTextForConversion(text: string): string {
    // Strip HTML tags and get plain text
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, " ").trim();
    
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
      .map(h => h.replace(/<\/?[^>]+(>|$)/g, ""))
      .join(". ");
    
    // Construct the summary with intro and key points
    return `Here's a summary of the notes: ${introduction}... The key points covered are: ${headings}`;
  }
}
