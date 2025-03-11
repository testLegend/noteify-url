
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '@/services/AuthService';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, LogOut, User, FileText } from "lucide-react";

const UserMenu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = AuthService.getCurrentUser();
  
  const handleLogout = () => {
    AuthService.logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/login');
  };
  
  if (!user) {
    return (
      <div className="flex space-x-2">
        <Button variant="outline" onClick={() => navigate('/login')}>
          Login
        </Button>
        <Button onClick={() => navigate('/register')}>
          Register
        </Button>
      </div>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {user.isPremium && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
              <Crown className="h-3 w-3 text-amber-500" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
            {user.isPremium ? (
              <span className="text-xs mt-1 flex items-center text-amber-500">
                <Crown className="h-3 w-3 mr-1" /> Premium User
              </span>
            ) : (
              <span className="text-xs mt-1 text-muted-foreground">
                Free User ({2 - user.noteCount} notes remaining)
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/saved-notes')}>
          <FileText className="mr-2 h-4 w-4" />
          <span>My Saved Notes</span>
        </DropdownMenuItem>
        {!user.isPremium && (
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/premium')}>
            <Crown className="mr-2 h-4 w-4" />
            <span>Upgrade to Premium</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-500" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
