
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isPremium: boolean;
  noteCount: number;
}

export class AuthService {
  static readonly USERS_KEY = 'noteify_users';
  static readonly CURRENT_USER_KEY = 'noteify_current_user';

  // Get all registered users
  static getUsers(): User[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Save users to localStorage
  static saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Register a new user
  static register(email: string, password: string, name: string): User | null {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return null;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      isPremium: false,
      noteCount: 0
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  // Log in a user
  static login(email: string, password: string): User | null {
    const users = this.getUsers();
    const user = users.find(user => user.email === email && user.password === password);
    
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    
    return null;
  }

  // Get the current logged in user
  static getCurrentUser(): User | null {
    const user = localStorage.getItem(this.CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Log out the current user
  static logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Check if user can create note
  static canCreateNote(): boolean {
    const user = this.getCurrentUser();
    
    if (!user) return false;
    if (user.isPremium) return true;
    
    return user.noteCount < 2;
  }

  // Increment note count for user
  static incrementNoteCount(): void {
    const user = this.getCurrentUser();
    if (!user) return;

    user.noteCount += 1;
    
    // Update user in users array
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
    }
    
    // Update current user
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  // Upgrade user to premium
  static upgradeToPremium(): void {
    const user = this.getCurrentUser();
    if (!user) return;

    user.isPremium = true;
    
    // Update user in users array
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
    }
    
    // Update current user
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }
}
