
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
          
          <div className="prose prose-sm sm:prose lg:prose-lg">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Noteify service, you agree to be bound by these Terms and Conditions. 
              If you do not agree to all of these terms, you may not use the service.
            </p>
            
            <h2>2. Web Scraping and Data Collection</h2>
            <p>
              Noteify converts websites into notes by legally scraping publicly accessible data. By using our service:
            </p>
            <ul>
              <li>You confirm that you are requesting content from websites that you have legal access to.</li>
              <li>You acknowledge that our service only processes publicly available content.</li>
              <li>You understand that you are responsible for ensuring your use of the extracted content complies with copyright laws.</li>
              <li>You agree not to use our service to scrape content that is behind authentication or otherwise restricted.</li>
            </ul>
            
            <h2>3. User Accounts</h2>
            <p>
              To access certain features of the service, you may need to create an account. You are responsible for maintaining the confidentiality of your account information.
            </p>
            
            <h2>4. Premium Service</h2>
            <p>
              Free users are limited to 2 note conversions. Premium users gain unlimited note conversions and additional features.
            </p>
            
            <h2>5. Limitation of Liability</h2>
            <p>
              Noteify is provided "as is" without warranties of any kind. We are not responsible for the content of any websites processed through our service or how you use the resulting notes.
            </p>
            
            <h2>6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the service after changes constitutes acceptance of the updated terms.
            </p>
            
            <h2>7. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.
            </p>
            
            <h2>8. Contact</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at support@noteify.com.
            </p>
          </div>
          
          <div className="mt-8">
            <Link to="/" className="text-primary hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2023 Noteify - Convert websites to beautiful notes</p>
        </div>
      </footer>
    </div>
  );
};

export default Terms;
