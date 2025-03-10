
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PdfExporter {
  static async exportToPdf(elementId: string, filename: string = 'notes.pdf'): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      
      if (!element) {
        throw new Error(`Element with id "${elementId}" not found`);
      }
      
      // Create a copy of the element to modify for PDF export
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '750px'; // Fixed width for PDF
      clone.style.padding = '20px';
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);
      
      try {
        const canvas = await html2canvas(clone, {
          scale: 1.5, // Higher scale for better quality
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        // Calculate PDF dimensions (A4 format)
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;
        
        // Add image to PDF
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95), 
          'JPEG', 
          0, 
          position, 
          imgWidth, 
          imgHeight
        );
        
        // Handle multiple pages if content is too long
        let heightLeft = imgHeight - pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(
            canvas.toDataURL('image/jpeg', 0.95),
            'JPEG',
            0,
            position,
            imgWidth,
            imgHeight
          );
          heightLeft -= pageHeight;
        }
        
        // Save the PDF
        pdf.save(filename);
      } finally {
        // Clean up the clone
        document.body.removeChild(clone);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }
}
