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
  const [loading, setLoading] = useState<boolean>(true);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setOnboardingStep('signup');
      }
      setLoading(false);
    });

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile && !error) {
      const loadedUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name || '',
        bio: profile.bio || '',
        photoUrl: profile.photo_url || '',
        interests: (profile.interests || []) as InterestTag[],
        createdAt: new Date(profile.created_at),
      };
      setUser(loadedUser);
      
      // Determine onboarding step based on profile completeness
      if (!profile.interests || profile.interests.length === 0) {
        setOnboardingStep('interests');
      } else if (!profile.name) {
        setOnboardingStep('profile');
      } else {
        setOnboardingStep('complete');
        await assignNewRecipient();
        await checkUnreadPostcards(userId);
      }
    }
  };

  // Check for unread postcards
  const checkUnreadPostcards = async (userId: string) => {
    const { count } = await supabase
      .from('postcards')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    
    setHasUnreadPostcards((count || 0) > 0);
  };

  // Load postcards for user
  const loadPostcards = useCallback(async (userId: string) => {
    const { data: sentPostcards } = await supabase
      .from('postcards')
      .select(`
        *,
        sender:profiles!postcards_sender_id_fkey(name),
        recipient:profiles!postcards_recipient_id_fkey(name)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('sent_at', { ascending: false });

    if (sentPostcards) {
      const formattedPostcards: Postcard[] = sentPostcards.map((p: any) => ({
        id: p.id,
        senderId: p.sender_id,
        senderName: p.sender?.name || 'Unknown',
        recipientId: p.recipient_id,
        recipientName: p.recipient?.name || 'Unknown',
        templateId: p.template_id,
        message: p.message,
        imageUrl: p.image_url,
        stampId: p.stamp_id,
        createdAt: new Date(p.created_at),
        sentAt: new Date(p.sent_at),
      }));
      setPostcards(formattedPostcards);
    }
  }, []);

  // Load postcards when user changes
  useEffect(() => {
    if (user?.id && onboardingStep === 'complete') {
      loadPostcards(user.id);
    }
  }, [user?.id, onboardingStep, loadPostcards]);

  const assignNewRecipient = useCallback(async () => {
    if (!user?.id) {
      const randomIndex = Math.floor(Math.random() * MOCK_RECIPIENTS.length);
      setCurrentRecipient(MOCK_RECIPIENTS[randomIndex]);
      return;
    }

    // Get a random user from the database (excluding current user)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, interests')
      .neq('id', user.id)
      .not('name', 'is', null)
      .limit(10);

    if (profiles && profiles.length > 0) {
      const randomIndex = Math.floor(Math.random() * profiles.length);
      const profile = profiles[randomIndex];
      setCurrentRecipient({
        id: profile.id,
        name: profile.name || 'Anonymous',
        interests: (profile.interests || []) as string[],
      });
    } else {
      // Fallback to mock recipients if no other users
      const randomIndex = Math.floor(Math.random() * MOCK_RECIPIENTS.length);
      setCurrentRecipient(MOCK_RECIPIENTS[randomIndex]);
    }
  }, [user?.id]);

  const markPostcardsAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    await supabase
      .from('postcards')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);
    
    setHasUnreadPostcards(false);
  }, [user?.id]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const newUser: User = {
        id: data.user.id,
        email,
        name: '',
        bio: '',
        photoUrl: '',
        interests: [],
        createdAt: new Date(),
      };
      setUser(newUser);
      setOnboardingStep('interests');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await loadUserProfile(data.user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOnboardingStep('signup');
    setCurrentRecipient(null);
    setPostcards([]);
  };

  const updateUserInterests = async (interests: InterestTag[]) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ interests })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, interests });
      setOnboardingStep('profile');
    }
  };

  const updateUserProfile = async (name: string, bio: string, photoUrl: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ name, bio, photo_url: photoUrl })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, name, bio, photoUrl });
      setOnboardingStep('complete');
      await assignNewRecipient();
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('postcards')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('postcards')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const addPostcard = async (postcard: Omit<Postcard, 'id' | 'createdAt' | 'sentAt'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('postcards')
      .insert({
        sender_id: user.id,
        recipient_id: postcard.recipientId,
        template_id: postcard.templateId,
        message: postcard.message,
        image_url: postcard.imageUrl,
        stamp_id: postcard.stampId,
      })
      .select()
      .single();

    if (!error && data) {
      const newPostcard: Postcard = {
        id: data.id,
        senderId: data.sender_id,
        senderName: user.name,
        recipientId: data.recipient_id,
        recipientName: postcard.recipientName,
        templateId: data.template_id,
        message: data.message,
        imageUrl: data.image_url,
        stampId: data.stamp_id,
        createdAt: new Date(data.created_at),
        sentAt: new Date(data.sent_at),
      };
      setPostcards((prev) => [newPostcard, ...prev]);
      await assignNewRecipient();
    }
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
        loading,
        uploadImage,
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
