import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { User, OnboardingStep, InterestTag, Postcard, Recipient } from '@/types';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  onboardingStep: OnboardingStep;
  setOnboardingStep: (step: OnboardingStep) => void;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
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


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('signup');
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState<Recipient | null>(null);
  const [hasUnreadPostcards, setHasUnreadPostcards] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const isSigningUpRef = useRef<boolean>(false);

  // Debug logging
  useEffect(() => {
    console.log('[AuthContext] State update:', {
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      onboardingStep,
      loading,
      isAuthenticated: !!user && onboardingStep === 'complete',
    });
  }, [user, onboardingStep, loading]);

  // Check for unread postcards
  const checkUnreadPostcards = useCallback(async (userId: string) => {
    try {
      const { count } = await supabase
        .from('postcards')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      setHasUnreadPostcards((count || 0) > 0);
    } catch (error) {
      console.error('Error checking unread postcards:', error);
    }
  }, []);

  const assignNewRecipient = useCallback(async (userId?: string) => {
    if (!userId) {
      console.warn('[AuthContext] Cannot assign recipient without userId');
      setCurrentRecipient(null);
      return;
    }

    try {
      // Get all users from the database (excluding current user)
      // Get more users to have better randomization
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, name, interests')
        .neq('id', userId)
        .not('name', 'is', null)
        .limit(100); // Get more users for better randomization

      if (error) {
        console.error('[AuthContext] Error fetching recipients:', error);
        setCurrentRecipient(null);
        return;
      }

      if (profiles && profiles.length > 0) {
        const randomIndex = Math.floor(Math.random() * profiles.length);
        const profile = profiles[randomIndex];
        setCurrentRecipient({
          id: profile.id,
          name: profile.name || 'Anonymous',
          interests: (profile.interests || []) as string[],
        });
        console.log('[AuthContext] Assigned recipient:', profile.name);
      } else {
        console.warn('[AuthContext] No other users found in database');
        setCurrentRecipient(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error assigning recipient:', error);
      setCurrentRecipient(null);
    }
  }, []);

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string): Promise<boolean> => {
    console.log('[AuthContext] loadUserProfile called for userId:', userId);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('[AuthContext] Profile query result:', { profile: profile ? 'found' : 'not found', error });

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
        console.log('[AuthContext] Setting user:', { id: loadedUser.id, email: loadedUser.email, name: loadedUser.name, interestsCount: loadedUser.interests.length });
        setUser(loadedUser);
        
        // Determine onboarding step based on profile completeness
        if (!profile.interests || profile.interests.length === 0) {
          console.log('[AuthContext] No interests found, setting step to interests');
          setOnboardingStep('interests');
        } else if (!profile.name) {
          console.log('[AuthContext] No name found, setting step to profile');
          setOnboardingStep('profile');
        } else {
          console.log('[AuthContext] Profile complete, setting step to complete');
          setOnboardingStep('complete');
          // Load recipient and check postcards in parallel, don't await
          assignNewRecipient(userId).catch(err => console.error('[AuthContext] Error assigning recipient:', err));
          checkUnreadPostcards(userId).catch(err => console.error('[AuthContext] Error checking postcards:', err));
        }
        return true;
      }
      
      // Profile not found or error loading
      if (error) {
        console.error('[AuthContext] Error loading user profile:', error);
      }
      return false;
    } catch (error) {
      console.error('[AuthContext] Error in loadUserProfile:', error);
      return false;
    }
  }, [assignNewRecipient, checkUnreadPostcards]);

  // Listen for auth state changes
  useEffect(() => {
    console.log('[AuthContext] Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state change:', { event, hasSession: !!session, userId: session?.user?.id, isSigningUp: isSigningUpRef.current });
      try {
        // Skip SIGNED_IN event during signup - we handle it in signUp function
        if (event === 'SIGNED_IN' && isSigningUpRef.current) {
          console.log('[AuthContext] Skipping SIGNED_IN event during signup');
          // Don't set loading to false here - let signUp handle it
          return;
        }
        
        // Skip TOKEN_REFRESHED events during signup
        if (event === 'TOKEN_REFRESHED' && isSigningUpRef.current) {
          console.log('[AuthContext] Skipping TOKEN_REFRESHED event during signup');
          return;
        }
        
        if (session?.user) {
          console.log('[AuthContext] Session found, loading profile for:', session.user.id);
          await loadUserProfile(session.user.id);
        } else {
          console.log('[AuthContext] No session, resetting to signup');
          setUser(null);
          setOnboardingStep('signup');
        }
      } catch (error) {
        console.error('[AuthContext] Error in auth state change:', error);
      } finally {
        // Only set loading to false if we're not in the middle of signup
        if (!isSigningUpRef.current) {
          console.log('[AuthContext] Setting loading to false (not signing up)');
          setLoading(false);
        } else {
          console.log('[AuthContext] Not setting loading to false (signup in progress)');
        }
      }
    });

    // Check initial session
    console.log('[AuthContext] Checking initial session');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[AuthContext] Initial session check:', { hasSession: !!session, userId: session?.user?.id });
      try {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('[AuthContext] Error loading initial session:', error);
      } finally {
        console.log('[AuthContext] Initial session check complete, setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      console.log('[AuthContext] Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

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

  // Public assignNewRecipient function (uses current user)
  const assignNewRecipientPublic = useCallback(async () => {
    if (!user?.id) {
      console.warn('[AuthContext] Cannot assign recipient without user');
      setCurrentRecipient(null);
      return;
    }
    await assignNewRecipient(user.id);
  }, [user?.id, assignNewRecipient]);

  const markPostcardsAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    await supabase
      .from('postcards')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);
    
    setHasUnreadPostcards(false);
  }, [user?.id]);

  const signUp = async (email: string, password: string, name?: string) => {
    console.log('[AuthContext] signUp called for email:', email, 'name:', name);
    // Set flag to prevent auth state change listener from interfering
    isSigningUpRef.current = true;
    console.log('[AuthContext] Set isSigningUpRef to true');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('[AuthContext] Sign up error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('User creation failed - no user data returned');
      }

      // Wait a bit for trigger to potentially create profile, then create manually if needed
      // This handles cases where the trigger fails or RLS blocks it
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try to create profile manually (upsert handles both cases)
      // Include name if provided during signup
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email || email,
          name: name || null, // Save name if provided
        }, {
          onConflict: 'id',
        });

      if (profileError) {
        console.error('[AuthContext] Error creating profile:', profileError);
        // Check if profile was created by trigger
        const { data: existingProfile, error: loadError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (loadError || !existingProfile) {
          // If we still can't find/create the profile, throw a user-friendly error
          throw new Error('Failed to create user profile. Please contact support if this issue persists.');
        }
      }

      // If session exists (email confirmation disabled), load the profile
      if (data.session) {
        console.log('[AuthContext] Session exists, loading profile');
        
        // Try to load profile, but if it fails, set user state manually
        const profileLoaded = await loadUserProfile(data.user.id);
        console.log('[AuthContext] Profile loaded:', profileLoaded);
        if (!profileLoaded) {
          console.log('[AuthContext] Profile load failed, setting user state manually');
          // Profile might not exist yet or failed to load, set user state manually
          const newUser: User = {
            id: data.user.id,
            email: data.user.email || email,
            name: name || '',
            bio: '',
            photoUrl: '',
            interests: [],
            createdAt: new Date(),
          };
          setUser(newUser);
          // If name was provided, skip to interests, otherwise start at interests
          setOnboardingStep('interests');
        }
        // Ensure loading is set to false after everything is done
        console.log('[AuthContext] Signup complete, setting loading to false');
        setLoading(false);
      } else {
        console.log('[AuthContext] No session (email confirmation required), setting user state manually');
        // Email confirmation required - set user state from auth data
        const newUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          name: name || '',
          bio: '',
          photoUrl: '',
          interests: [],
          createdAt: new Date(),
        };
        setUser(newUser);
        setOnboardingStep('interests');
        // Ensure loading is set to false
        console.log('[AuthContext] Signup complete (no session), setting loading to false');
        setLoading(false);
      }
    } catch (error) {
      console.error('[AuthContext] Error in signUp:', error);
      // Make sure loading is set to false even on error
      setLoading(false);
      // Clear the flag immediately on error
      isSigningUpRef.current = false;
      throw error;
    } finally {
      // Clear flag after signup completes (with delay to catch any delayed auth events)
      setTimeout(() => {
        console.log('[AuthContext] Clearing isSigningUpRef');
        isSigningUpRef.current = false;
      }, 3000); // Increased delay to ensure auth events are handled
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
      await assignNewRecipient(user.id);
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

  const addPostcard = useCallback(async (postcard: Omit<Postcard, 'id' | 'createdAt' | 'sentAt'>) => {
    if (!user) {
      console.error('[AuthContext] Cannot add postcard without user');
      return;
    }

    console.log('[AuthContext] Adding postcard:', { 
      senderId: user.id, 
      recipientId: postcard.recipientId,
      message: postcard.message?.substring(0, 50) + '...'
    });

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
      .select(`
        *,
        sender:profiles!postcards_sender_id_fkey(name),
        recipient:profiles!postcards_recipient_id_fkey(name)
      `)
      .single();

    if (error) {
      console.error('[AuthContext] Error adding postcard:', error);
      throw error;
    }

    if (data) {
      const newPostcard: Postcard = {
        id: data.id,
        senderId: data.sender_id,
        senderName: data.sender?.name || user.name,
        recipientId: data.recipient_id,
        recipientName: data.recipient?.name || postcard.recipientName,
        templateId: data.template_id,
        message: data.message,
        imageUrl: data.image_url,
        stampId: data.stamp_id,
        createdAt: new Date(data.created_at),
        sentAt: new Date(data.sent_at),
      };
      
      // Update local state immediately
      setPostcards((prev) => [newPostcard, ...prev]);
      console.log('[AuthContext] Postcard added to local state');
      
      // Reload postcards from database to ensure consistency
      if (user.id) {
        await loadPostcards(user.id);
        console.log('[AuthContext] Postcards reloaded from database');
        await assignNewRecipient(user.id);
      }
    }
  }, [user, loadPostcards, assignNewRecipient]);

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
        assignNewRecipient: assignNewRecipientPublic,
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
