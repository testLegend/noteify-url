
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

const Header = () => {
  return (
    <header className="bg-background border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold text-primary">Noteify</span>
        </Link>
        <UserMenu />
      </div>
    </header>
  );
};

export default Header;
