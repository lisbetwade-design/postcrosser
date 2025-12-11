import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Camera, Home, User, FolderOpen, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Feather pen icon
const FEATHER_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765311281940-node-29%3A1295-1765311281571.png';

// User avatar icon
const USER_AVATAR_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765287870048-node-10%3A843-1765287869788.png';

// Edit icon
const EDIT_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765287870043-node-10%3A876-1765287869788.png';

// Logout icon
const LOGOUT_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765289311699-node-10%3A968-1765289311344.png';

export function Profile() {
  const navigate = useNavigate();
  const { user, signOut, updateUserProfile, updateUserInterests, hasUnreadPostcards, uploadImage } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // User data
  const [editName, setEditName] = useState(user?.name || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editPhotoUrl, setEditPhotoUrl] = useState(user?.photoUrl || '');
  const [editInterests, setEditInterests] = useState<string[]>(
    (user?.interests as string[]) || []
  );
  const [newInterest, setNewInterest] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditBio(user.bio || '');
      setEditPhotoUrl(user.photoUrl || '');
      setEditInterests((user.interests as string[]) || []);
    }
  }, [user]);

  const displayName = user?.name || '';
  const email = user?.email || '';
  const bio = user?.bio || '';
  const photoUrl = user?.photoUrl || '';
  const interests = user?.interests || [];
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  const handleRemoveInterest = (interestToRemove: string) => {
    setEditInterests(prev => prev.filter(i => i !== interestToRemove));
  };

  const handleAddInterest = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      if (!editInterests.includes(newInterest.trim().toLowerCase())) {
        setEditInterests(prev => [...prev, newInterest.trim().toLowerCase()]);
      }
      setNewInterest('');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadImage) {
      setIsUploadingAvatar(true);
      try {
        const url = await uploadImage(file);
        if (url) {
          setEditPhotoUrl(url);
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    updateUserProfile(editName, editBio, editPhotoUrl);
    updateUserInterests(editInterests);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(displayName);
    setEditBio(bio);
    setEditPhotoUrl(photoUrl);
    setEditInterests(interests as string[]);
    setIsEditing(false);
  };

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      {/* Header - 128px from top */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 pt-11 z-10">
        {/* Logo - Left */}
        <div className="flex items-center gap-2">
          <img 
            src={FEATHER_ICON} 
            alt="Feather pen" 
            className="w-[18px] h-[18px]"
          />
          <span className="font-indie-flower text-[#312929] text-[28px]">Postcrosser</span>
        </div>

        {/* Navigation - Right */}
        <nav className="flex items-center bg-white/50 rounded-[42px] px-4 py-3 gap-4 shadow-[0px_4px_4px_0px_rgba(158,158,158,0.25)]">
          <button 
            onClick={() => navigate('/')}
            className="p-0 hover:opacity-70 transition-opacity"
          >
            <Home className="w-4 h-4 text-[#312929]" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="p-0 hover:opacity-70 transition-opacity"
          >
            <User className="w-4 h-4 text-[#312929]" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => navigate('/collection')}
            className="p-0 hover:opacity-70 transition-opacity relative"
          >
            <FolderOpen className="w-4 h-4 text-[#312929]" strokeWidth={1.5} />
            {hasUnreadPostcards && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>
          <div className="w-px h-4 bg-[#d9d9d9]" />
          <button 
            onClick={signOut}
            className="p-0 hover:opacity-70 transition-opacity"
          >
            <LogOut className="w-4 h-4 text-[#312929]" strokeWidth={1.5} />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-start min-h-screen pt-[128px] px-4">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-indie-flower text-[#312929] text-5xl mb-8 text-center"
        >
          My Profile
        </motion.h1>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-[845px] bg-white rounded-lg shadow-md p-12 relative"
        >
          {!isEditing ? (
            /* View Mode */
            <>
              {/* Edit Button - Top Right */}
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-6 flex items-center gap-2 hover:opacity-70 transition-opacity"
              >
                <img 
                  src={EDIT_ICON} 
                  alt="Edit" 
                  className="w-4 h-4"
                />
                <span className="text-[#312929] text-sm leading-5">Edit</span>
              </button>

              <div className="flex gap-8">
                {/* Avatar */}
                <div className="w-[120px] h-[120px] rounded-full border-2 border-[#312929] flex items-center justify-center flex-shrink-0 overflow-hidden bg-white">
                  {photoUrl ? (
                    <img 
                      src={photoUrl} 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={USER_AVATAR_ICON} 
                      alt="User avatar" 
                      className="w-16 h-16 opacity-60"
                    />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  {/* Name */}
                  <h2 className="font-indie-flower text-[#312929] text-3xl leading-9 mb-1">
                    {displayName}
                  </h2>
                  
                  {/* Bio */}
                  {bio && (
                    <p className="text-[#312929] text-lg leading-7 mb-6">
                      {bio}
                    </p>
                  )}

                  {/* Email */}
                  <div className="mb-6">
                    <p className="font-indie-flower text-[#312929] text-xl leading-7 mb-1">
                      Email:
                    </p>
                    <p className="text-[#312929] text-lg leading-7">
                      {email}
                    </p>
                  </div>

                  {/* Interests */}
                  <div className="mb-6">
                    <p className="font-indie-flower text-[#312929] text-xl leading-7 mb-3">
                      Interests:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(interests as string[]).map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-[#322a2a] text-white text-sm font-inter rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#e5e5e5] mb-4" />

                  {/* Member since */}
                  <p className="text-[#8b7355] text-sm leading-5">
                    Member since {memberSince}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Edit Mode */
            <div className="flex gap-8">
              {/* Avatar with camera button */}
              <div className="relative flex-shrink-0">
                <div className="w-[120px] h-[120px] rounded-full border-2 border-dashed border-[#312929] flex items-center justify-center overflow-hidden bg-white">
                  {editPhotoUrl ? (
                    <img 
                      src={editPhotoUrl} 
                      alt="User avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={USER_AVATAR_ICON} 
                      alt="User avatar" 
                      className="w-16 h-16 opacity-60"
                    />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#8b7355] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#7a6a4a] transition-colors disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>

              {/* Edit Form */}
              <div className="flex-1 space-y-6">
                {/* Name */}
                <div>
                  <label className="font-indie-flower text-[#312929] text-2xl leading-8 block mb-1">
                    Name:
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="font-indie-flower text-[#312929] text-xl leading-7 w-full border-b border-[#a9a8a8] bg-transparent py-2 focus:outline-none focus:border-[#312929]"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="font-indie-flower text-[#312929] text-2xl leading-8 block mb-1">
                    Bio:
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us a little about yourself..."
                    rows={3}
                    className="font-indie-flower text-[#312929] text-lg leading-7 w-full border-b border-[#a9a8a8] bg-transparent py-2 focus:outline-none focus:border-[#312929] resize-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-indie-flower text-[#312929] text-2xl leading-8 block mb-1">
                    Email:
                  </label>
                  <p className="text-[#312929] text-lg leading-7">
                    {email}
                  </p>
                  <p className="text-[#8b7355] text-sm leading-5 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Interests */}
                <div>
                  <label className="font-indie-flower text-[#312929] text-2xl leading-8 block mb-3">
                    Interests:
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editInterests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-[#322a2a] text-white text-sm font-inter rounded-full flex items-center gap-2"
                      >
                        {interest}
                        <button 
                          onClick={() => handleRemoveInterest(interest)}
                          className="hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleAddInterest}
                    placeholder="Add an interest..."
                    className="font-indie-flower text-[#312929] text-xl w-full border-b border-[#a9a8a8] bg-transparent py-2 focus:outline-none focus:border-[#312929] placeholder:text-[#a9a8a8]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-[#322a2a] text-white text-sm rounded-lg hover:bg-[#322a2a]/90 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-white text-[#312929] text-sm rounded-lg border border-[#a9a8a8] hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                </div>
              </div>
            )}
        </motion.div>
      </main>
    </div>
  );
}
