
import { GeminiService } from './GeminiService';

export class WebScraperService {
  static async scrapeWebsite(url: string): Promise<string> {
    try {
      // In a production environment, we would use a backend service
      // to avoid CORS issues. For this demo, we'll use a proxy service
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      console.log('Fetching content from:', proxyUrl);
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content from ${url}`);
      }
      
      const htmlContent = await response.text();
      console.log('Received HTML content length:', htmlContent.length);
      
      // Extract and clean the content
      const extractedContent = this.extractContentFromHtml(htmlContent);
      
      // Generate AI-powered notes using Gemini API
      const apiKey = GeminiService.getApiKey();
      if (!apiKey) {
        return extractedContent; // Fallback to basic extraction if no API key
      }
      
      try {
        const aiNotes = await GeminiService.generateNotes(extractedContent, url);
        return aiNotes;
      } catch (error) {
        console.error('Error using Gemini API, falling back to basic extraction:', error);
        return extractedContent;
      }
    } catch (error) {
      console.error('Error scraping website:', error);
      throw error;
    }
  }

  private static extractContentFromHtml(html: string): string {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove unwanted elements
    const elementsToRemove = [
      'script', 'style', 'svg', 'img', 'iframe', 'nav', 'footer', 
      'header', 'aside', 'form', 'button', '[role="banner"]', 
      '[role="navigation"]', '[role="complementary"]'
    ];
    
    elementsToRemove.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Extract main content - try different content selectors
    const contentSelectors = [
      'article', 'main', '[role="main"]', '.content', '.post', 
      '.post-content', '.entry-content', '#content'
    ];
    
    let mainContent = null;
    
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element && element.textContent && element.textContent.trim().length > 500) {
        mainContent = element;
        break;
      }
    }
    
    // If no main content is found, use the body
    if (!mainContent) {
      mainContent = doc.body;
    }
    
    // Format the content
    return this.formatContent(mainContent);
  }

  private static formatContent(element: Element): string {
    // Basic content cleanup and formatting
    const title = document.title || 'Extracted Notes';
    
    // Extract headings and paragraphs
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const paragraphs = Array.from(element.querySelectorAll('p'));
    const lists = Array.from(element.querySelectorAll('ul, ol'));
    
    // Combine all content
    let formattedContent = `<h1>${title}</h1>`;
    
    // Add headings with their hierarchy preserved
    headings.forEach(heading => {
      formattedContent += heading.outerHTML;
    });
    
    // Add paragraphs
    paragraphs.forEach(paragraph => {
      if (paragraph.textContent && paragraph.textContent.trim().length > 10) {
        formattedContent += paragraph.outerHTML;
      }
    });
    
    // Add lists
    lists.forEach(list => {
      formattedContent += list.outerHTML;
    });
    
    return formattedContent;
  }
}
