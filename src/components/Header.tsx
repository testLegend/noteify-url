
import { Link, useLocation } from 'react-router-dom';
import UserMenu from './UserMenu';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-background border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-primary">Noteify</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className={`text-sm hover:text-primary hidden md:inline-block ${
              location.pathname === '/' ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/terms" 
            className={`text-sm hover:text-primary hidden md:inline-block ${
              location.pathname === '/terms' ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            Terms & Conditions
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
