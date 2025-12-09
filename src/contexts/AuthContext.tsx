import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, OnboardingStep, InterestTag, Postcard, Recipient } from '@/types';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  onboardingStep: OnboardingStep;
  setOnboardingStep: (step: OnboardingStep) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserInterests: (interests: InterestTag[]) => Promise<void>;
  updateUserProfile: (name: string, bio: string, photoUrl: string) => Promise<void>;
  postcards: Postcard[];
  addPostcard: (postcard: Omit<Postcard, 'id' | 'createdAt' | 'sentAt'>) => Promise<void>;
  currentRecipient: Recipient | null;
  assignNewRecipient: () => Promise<void>;
  hasUnreadPostcards: boolean;
  markPostcardsAsRead: () => Promise<void>;
  loading: boolean;
  uploadImage: (file: File) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock recipients for demo
const MOCK_RECIPIENTS: Recipient[] = [
  { id: '1', name: 'Emma Thompson', interests: ['Travel', 'Photography', 'Art'] },
  { id: '2', name: 'James Wilson', interests: ['Music', 'Books', 'Nature'] },
  { id: '3', name: 'Sofia Garcia', interests: ['Cooking', 'Gardening', 'Crafts'] },
  { id: '4', name: 'Liam Chen', interests: ['Technology', 'Gaming', 'Science'] },
  { id: '5', name: 'Olivia Brown', interests: ['Fashion', 'Art', 'Movies'] },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('signup');
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState<Recipient | null>(null);
  const [hasUnreadPostcards, setHasUnreadPostcards] = useState<boolean>(false);

  const assignNewRecipient = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * MOCK_RECIPIENTS.length);
    setCurrentRecipient(MOCK_RECIPIENTS[randomIndex]);
  }, []);

  const markPostcardsAsRead = useCallback(() => {
    setHasUnreadPostcards(false);
  }, []);

  const signUp = async (email: string, _password: string) => {
    // Mock sign up - in real app, this would call Supabase
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name: '',
      bio: '',
      photoUrl: '',
      interests: [],
      createdAt: new Date(),
    };
    setUser(newUser);
    setOnboardingStep('interests');
  };

  const signIn = async (email: string, _password: string) => {
    // Mock sign in
    const existingUser: User = {
      id: crypto.randomUUID(),
      email,
      name: 'Returning User',
      bio: 'Welcome back!',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      interests: ['Travel', 'Photography'],
      createdAt: new Date(),
    };
    setUser(existingUser);
    setOnboardingStep('complete');
    assignNewRecipient();
    // Simulate having unread postcards for returning users
    setHasUnreadPostcards(true);
  };

  const signOut = () => {
    setUser(null);
    setOnboardingStep('signup');
    setCurrentRecipient(null);
  };

  const updateUserInterests = (interests: InterestTag[]) => {
    if (user) {
      setUser({ ...user, interests });
      setOnboardingStep('profile');
    }
  };

  const updateUserProfile = (name: string, bio: string, photoUrl: string) => {
    if (user) {
      setUser({ ...user, name, bio, photoUrl });
      setOnboardingStep('complete');
      assignNewRecipient();
    }
  };

  const addPostcard = (postcard: Postcard) => {
    setPostcards((prev) => [postcard, ...prev]);
    // Assign new recipient after sending
    assignNewRecipient();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && onboardingStep === 'complete',
        onboardingStep,
        setOnboardingStep,
        signUp,
        signIn,
        signOut,
        updateUserInterests,
        updateUserProfile,
        postcards,
        addPostcard,
        currentRecipient,
        assignNewRecipient,
        hasUnreadPostcards,
        markPostcardsAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
