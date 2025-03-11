
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Save, UserRound } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    setName(currentUser.name);
    setEmail(currentUser.email);
  }, [navigate]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        const users = AuthService.getUsers();
        const updatedUser = { ...user, name, email };
        
        // Update user in users array
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          AuthService.saveUsers(users);
          
          // Update current user in localStorage
          localStorage.setItem(AuthService.CURRENT_USER_KEY, JSON.stringify(updatedUser));
          
          // Update local state
          setUser(updatedUser);
          
          toast({
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          });
        }
      } catch (error) {
        toast({
          title: "Update failed",
          description: "There was an error updating your profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 800); // Simulate API call
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <Card>
                <CardContent className="pt-6 flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h2 className="text-xl font-semibold">{name}</h2>
                  <p className="text-sm text-muted-foreground mb-2">{email}</p>
                  
                  {user.isPremium ? (
                    <div className="mt-2 flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm">
                      <Crown className="h-4 w-4 mr-1" />
                      <span>Premium User</span>
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Free User ({2 - user.noteCount} notes remaining)
                    </div>
                  )}
                  
                  {!user.isPremium && (
                    <Button 
                      onClick={() => navigate('/premium')} 
                      variant="outline" 
                      className="mt-4"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full md:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <div className="relative">
                        <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="mr-2 h-4 w-4" /> Save Changes
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>
                    Your account usage information
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Notes Created</span>
                      <span className="font-semibold">{user.noteCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Account Type</span>
                      <span className="font-semibold">
                        {user.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </div>
                    
                    {!user.isPremium && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Notes Remaining</span>
                        <span className="font-semibold">{Math.max(0, 2 - user.noteCount)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
