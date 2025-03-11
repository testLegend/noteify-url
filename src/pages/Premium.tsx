
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
      
      <Footer />
    </div>
  );
};

export default Premium;
