
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import Header from '@/components/Header';
import PremiumUpgrade from '@/components/PremiumUpgrade';

const Premium = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      navigate('/login');
    } else if (user.isPremium) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <PremiumUpgrade />
      </main>
      
      <footer className="py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2023 Noteify - Convert websites to beautiful notes</p>
        </div>
      </footer>
    </div>
  );
};

export default Premium;
