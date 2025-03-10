
export class GeminiService {
  private static API_KEY_STORAGE_KEY = 'gemini_api_key';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Gemini API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async generateNotes(content: string, url: string): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const prompt = `
You are a professional note-taking assistant. I want you to create organized, clear notes from the following web content.
Your notes should:
1. Extract the key information and main points
2. Organize with proper headings and subheadings (use h2, h3, h4 tags)
3. Use bullet points (ul/li tags) for lists where appropriate
4. Keep important definitions and concepts
5. Format the output as semantic HTML with proper headings, paragraphs, and lists
6. Remove any advertisements or irrelevant content
7. Maintain academic integrity and factual accuracy
8. Create a concise summary at the beginning marked with <h2>Summary</h2>

Here is the content from the webpage (${url}):
${content}
`;

      console.log('Sending request to Gemini API');
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the generated text from the response
      const generatedText = data.candidates[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No text was generated');
      }
      
      return generatedText;
    } catch (error) {
      console.error('Error generating notes with Gemini:', error);
      throw error;
    }
  }
}
