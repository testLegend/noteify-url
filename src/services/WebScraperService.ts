
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
        return this.formatBasicNotes(extractedContent, url);
      }
      
      try {
        const aiNotes = await GeminiService.generateNotes(extractedContent, url);
        return aiNotes;
      } catch (error) {
        console.error('Error using Gemini API, falling back to basic extraction:', error);
        return this.formatBasicNotes(extractedContent, url);
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
      '[role="navigation"]', '[role="complementary"]', 
      '.ads', '.advertisement', '.cookie-banner', '.newsletter', 
      '.popup', '.modal', '.sidebar', '.comment'
    ];
    
    elementsToRemove.forEach(selector => {
      doc.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Extract main content - try different content selectors
    const contentSelectors = [
      'article', 'main', '[role="main"]', '.content', '.post', 
      '.post-content', '.entry-content', '#content', '.article', 
      '.page-content', '.main-content', '.article-content',
      '[itemprop="articleBody"]', '.story-body'
    ];
    
    let mainContent = null;
    
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element && element.textContent && element.textContent.trim().length > 500) {
        mainContent = element;
        break;
      }
    }
    
    // If no main content is found, try to get the largest content block
    if (!mainContent) {
      const allParagraphs = Array.from(doc.querySelectorAll('p'));
      const blocks: Record<string, Element[]> = {};
      
      // Group paragraphs by their parent to find the largest group
      allParagraphs.forEach(p => {
        const parent = p.parentElement;
        if (parent) {
          const parentSelector = this.getElementPath(parent);
          if (!blocks[parentSelector]) {
            blocks[parentSelector] = [];
          }
          blocks[parentSelector].push(p);
        }
      });
      
      // Find the parent with the most paragraphs
      let largestBlockParent = '';
      let largestBlockSize = 0;
      
      Object.entries(blocks).forEach(([parent, paragraphs]) => {
        if (paragraphs.length > largestBlockSize) {
          largestBlockSize = paragraphs.length;
          largestBlockParent = parent;
        }
      });
      
      // Use the parent with the most paragraphs
      if (largestBlockParent && largestBlockSize > 3) {
        mainContent = doc.querySelector(largestBlockParent);
      } else {
        mainContent = doc.body;
      }
    }
    
    // Format the content
    return this.formatContent(mainContent || doc.body);
  }
  
  private static getElementPath(element: Element): string {
    // Generate a CSS selector for an element based on its tag and classes
    const tag = element.tagName.toLowerCase();
    const classes = Array.from(element.classList).map(c => `.${c}`).join('');
    return tag + classes;
  }

  private static formatContent(element: Element): string {
    // Basic content cleanup and formatting
    const title = document.title || 'Extracted Notes';
    
    // Extract headings and paragraphs
    const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const paragraphs = Array.from(element.querySelectorAll('p'));
    const lists = Array.from(element.querySelectorAll('ul, ol'));
    const tables = Array.from(element.querySelectorAll('table'));
    
    // Combine all content
    let formattedContent = `<h1>${title}</h1>`;
    
    // Add headings with their hierarchy preserved
    headings.forEach(heading => {
      if (heading.textContent && heading.textContent.trim().length > 0) {
        formattedContent += heading.outerHTML;
      }
    });
    
    // Add paragraphs
    paragraphs.forEach(paragraph => {
      if (paragraph.textContent && paragraph.textContent.trim().length > 10) {
        formattedContent += paragraph.outerHTML;
      }
    });
    
    // Add lists
    lists.forEach(list => {
      if (list.textContent && list.textContent.trim().length > 0) {
        formattedContent += list.outerHTML;
      }
    });
    
    // Add tables
    tables.forEach(table => {
      if (table.textContent && table.textContent.trim().length > 0) {
        formattedContent += table.outerHTML;
      }
    });
    
    return formattedContent;
  }

  // New function to format basic notes when AI generation fails
  private static formatBasicNotes(content: string, url: string): string {
    const domain = new URL(url).hostname;
    const title = `Notes from ${domain}`;
    
    return `
      <h1>${title}</h1>
      <div class="executive-summary">
        <p>These notes contain extracted content from ${url}.</p>
        <p>The content has been organized to improve readability.</p>
      </div>
      <hr>
      <div class="content">
        ${content}
      </div>
      <hr>
      <p><strong>Note:</strong> This content was extracted automatically. For better notes, please ensure your Gemini API key is valid.</p>
    `;
  }
}
