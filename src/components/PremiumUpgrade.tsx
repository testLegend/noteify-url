
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, CheckCircle, Wand2, BookOpen, BadgeCheck } from "lucide-react";

const PremiumUpgrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = () => {
    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      AuthService.upgradeToPremium();
      
      toast({
        title: "Upgrade successful!",
        description: "You now have premium access",
      });
      
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <Card className="w-full max-w-xl shadow-lg border-primary/20">
      <CardHeader className="space-y-1 text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <Crown className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Upgrade to Premium</CardTitle>
        <CardDescription>
          Unlock unlimited note creation and premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-primary mr-2" />
            <div>
              <h3 className="font-medium">Unlimited Notes</h3>
              <p className="text-sm text-muted-foreground">Create as many notes as you want</p>
            </div>
          </div>
          <div className="flex items-start">
            <Wand2 className="h-5 w-5 text-primary mr-2" />
            <div>
              <h3 className="font-medium">Customize Notes</h3>
              <p className="text-sm text-muted-foreground">Modify notes with custom prompts tailored to your needs</p>
            </div>
          </div>
          <div className="flex items-start">
            <BookOpen className="h-5 w-5 text-primary mr-2" />
            <div>
              <h3 className="font-medium">Advanced Formatting</h3>
              <p className="text-sm text-muted-foreground">Access to premium note templates and styling</p>
            </div>
          </div>
          <div className="flex items-start">
            <BadgeCheck className="h-5 w-5 text-primary mr-2" />
            <div>
              <h3 className="font-medium">Priority Support</h3>
              <p className="text-sm text-muted-foreground">Get faster responses from our team</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center mb-2">
          <span className="text-3xl font-bold">$9.99</span>
          <span className="text-muted-foreground ml-1">/month</span>
        </div>
        <Button 
          onClick={handleUpgrade}
          className="w-full"
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
              <Crown className="mr-2 h-4 w-4" /> Upgrade Now
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PremiumUpgrade;
