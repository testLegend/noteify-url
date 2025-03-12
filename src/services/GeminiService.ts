
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
You are a professional note-taking assistant. I want you to create beautifully organized, clear, and structured notes from the following web content.
Your notes MUST:
1. Start with a concise executive summary (3-5 sentences maximum)
2. Create a clear table of contents with links to each section
3. Use proper hierarchy with well-organized headings and subheadings (h2, h3, h4 tags)
4. Present information in small, digestible chunks with plenty of white space
5. Use bullet points and numbered lists for clarity where appropriate
6. Include important definitions in blockquote elements
7. Bold key terms and concepts for easy scanning
8. Add clear section transitions and visual separators
9. Format code examples (if any) with syntax highlighting
10. Add a brief conclusion at the end

Format using semantic HTML with the following elements:
- <h1>, <h2>, <h3>, <h4> for headings
- <p> for paragraphs
- <ul> and <li> for unordered lists
- <ol> and <li> for ordered lists
- <blockquote> for definitions or important quotes
- <pre><code> for code blocks
- <strong> for bold/important text
- <em> for emphasized text
- <hr> for section breaks

Make the notes visually appealing and easy to read, focusing on clarity and structure.
Remove any advertisements or irrelevant content.

Here is the content from the webpage (${url}):
${content}
`;

      console.log('Sending request to Gemini API');
      // Updated to use the Gemini 2.0 Flash model
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
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
        const errorData = await response.json();
        console.error('Gemini API detailed error:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract the generated text from the response
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No text was generated');
      }
      
      return generatedText;
    } catch (error) {
      console.error('Error generating notes with Gemini:', error);
      throw error;
    }
  }

  static async customizeNotes(content: string, url: string, customPrompt: string): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      
      if (!apiKey) {
        throw new Error('Gemini API key not found');
      }

      const prompt = `
You are a professional note-taking assistant. I want you to REVISE and CUSTOMIZE the following notes about web content.

Here are the specific customization instructions from the user:
"${customPrompt}"

Please apply these customizations while maintaining:
1. Proper HTML formatting with semantic tags
2. Well-organized structure with clear headings
3. Visual appeal and readability

Format using semantic HTML with the following elements as needed:
- <h1>, <h2>, <h3>, <h4> for headings
- <p> for paragraphs
- <ul> and <li> for unordered lists
- <ol> and <li> for ordered lists
- <blockquote> for definitions or important quotes
- <pre><code> for code blocks
- <strong> for bold/important text
- <em> for emphasized text
- <hr> for section breaks

Here are the notes to customize (they are about content from ${url}):
${content}
`;

      console.log('Sending customization request to Gemini API');
      const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
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
            temperature: 0.3, // Slightly higher temperature for more creative customizations
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API detailed error:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Extract the generated text from the response
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('No text was generated');
      }
      
      return generatedText;
    } catch (error) {
      console.error('Error customizing notes with Gemini:', error);
      throw error;
    }
  }
}
