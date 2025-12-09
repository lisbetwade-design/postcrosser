export interface User {
  id: string;
  email: string;
  name: string;
  bio: string;
  photoUrl: string;
  interests: string[];
  createdAt: Date;
}

export interface Postcard {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  templateId: string;
  message: string;
  imageUrl?: string;
  stampId?: string;
  createdAt: Date;
  sentAt: Date;
}

export interface Recipient {
  id: string;
  name: string;
  interests: string[];
}

export type OnboardingStep = 'signup' | 'interests' | 'profile' | 'complete';

export const INTEREST_TAGS = [
  'Travel',
  'Photography',
  'Art',
  'Music',
  'Books',
  'Cooking',
  'Nature',
  'Technology',
  'Sports',
  'Movies',
  'Gaming',
  'Fashion',
  'Fitness',
  'Writing',
  'Gardening',
  'Crafts',
  'History',
  'Science',
  'Animals',
  'Food',
] as const;

export type InterestTag = typeof INTEREST_TAGS[number];
