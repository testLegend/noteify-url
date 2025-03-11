
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isPremium: boolean;
  noteCount: number;
}

interface SavedNote {
  id: string;
  userId: string;
  content: string;
  sourceUrl: string;
  title: string;
  createdAt: string;
}

export class AuthService {
  static readonly USERS_KEY = 'noteify_users';
  static readonly CURRENT_USER_KEY = 'noteify_current_user';
  static readonly SAVED_NOTES_KEY = 'noteify_saved_notes';

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

  // Get all saved notes
  static getSavedNotes(): SavedNote[] {
    const notes = localStorage.getItem(this.SAVED_NOTES_KEY);
    return notes ? JSON.parse(notes) : [];
  }

  // Get user's saved notes
  static getUserSavedNotes(): SavedNote[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    const allNotes = this.getSavedNotes();
    return allNotes.filter(note => note.userId === user.id);
  }

  // Save a note
  static saveNote(content: string, sourceUrl: string, title: string): SavedNote | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    const newNote: SavedNote = {
      id: crypto.randomUUID(),
      userId: user.id,
      content,
      sourceUrl,
      title,
      createdAt: new Date().toISOString()
    };
    
    const allNotes = this.getSavedNotes();
    allNotes.push(newNote);
    localStorage.setItem(this.SAVED_NOTES_KEY, JSON.stringify(allNotes));
    
    return newNote;
  }

  // Delete a note
  static deleteNote(noteId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const allNotes = this.getSavedNotes();
    const noteIndex = allNotes.findIndex(note => note.id === noteId && note.userId === user.id);
    
    if (noteIndex === -1) return false;
    
    allNotes.splice(noteIndex, 1);
    localStorage.setItem(this.SAVED_NOTES_KEY, JSON.stringify(allNotes));
    
    return true;
  }

  // Get a specific note
  static getNote(noteId: string): SavedNote | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    const allNotes = this.getSavedNotes();
    return allNotes.find(note => note.id === noteId && note.userId === user.id) || null;
  }
}
