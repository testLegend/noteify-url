
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-6 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2023 Noteify - Convert websites to beautiful notes
          </p>
          <div className="mt-4 sm:mt-0 flex gap-4 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-primary">
              Terms & Conditions
            </Link>
            <a href="mailto:support@noteify.com" className="text-muted-foreground hover:text-primary">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
