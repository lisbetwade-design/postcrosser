import { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Upload, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Postcard images for the collage
const POSTCARD_IMAGES = [
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280467981-node-9%3A388-1765280465411.png',
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280468261-node-9%3A391-1765280465516.png',
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280467903-node-9%3A385-1765280465327.png',
];

// Stamp images
const STAMP_IMAGES = [
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280468533-node-9%3A482-1765280465655.png',
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280468611-node-9%3A383-1765280465205.png',
];

// Feather pen icon
const FEATHER_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280469309-node-9%3A509-1765280469081.png';

export function ProfileSetup() {
  const { updateUserProfile, setOnboardingStep, uploadImage } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // Upload to Supabase storage
        const url = await uploadImage(file);
        if (url) {
          setPhotoUrl(url);
        } else {
          // Fallback to local preview if upload fails
          const reader = new FileReader();
          reader.onloadend = () => {
            setPhotoUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      } catch {
        // Fallback to local preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleComplete = async () => {
    if (name.trim()) {
      setIsLoading(true);
      try {
        // Allow empty photoUrl - user can proceed without uploading a picture
        await updateUserProfile(name, bio, photoUrl || '');
      } catch (err) {
        console.error('Error updating profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex relative overflow-hidden">
      {/* Logo - Top Left */}
      <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
        <img 
          src={FEATHER_ICON} 
          alt="Feather pen" 
          className="w-5 h-5"
        />
        <span className="font-indie-flower text-[#312929] text-[28px]">Postcrosser</span>
      </div>

      {/* Stamps - Top Right */}
      <div className="absolute top-6 right-6 flex items-start z-10">
        <img 
          src={STAMP_IMAGES[0]} 
          alt="Japanese stamp" 
          className="w-[100px] h-[150px] -rotate-[17deg]"
        />
        <img 
          src={STAMP_IMAGES[1]} 
          alt="US stamp" 
          className="w-[80px] h-[120px] rotate-[3deg] -ml-6 mt-2"
        />
      </div>

      {/* Left Side - Postcard Collage */}
      <div className="w-1/2 relative flex items-center justify-center p-8">
        {/* Postcard 1 - Top, rotated */}
        <div
          className="absolute left-1/2 -translate-x-1/2 ml-[-86px] top-[calc(12%+56px)] w-[260px] bg-white rounded-sm overflow-hidden -rotate-[12deg]"
          style={{
            boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <img 
            src={POSTCARD_IMAGES[0]} 
            alt="Dog looking out window" 
            className="w-full h-[320px] object-cover"
          />
        </div>

        {/* Postcard 2 - Center, slightly rotated right */}
        <div
          className="absolute left-1/2 -translate-x-1/2 ml-[86px] top-[calc(32%+56px)] w-[260px] bg-white rounded-sm overflow-hidden rotate-[5deg] z-10"
          style={{
            boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <img 
            src={POSTCARD_IMAGES[1]} 
            alt="European street with tram" 
            className="w-full h-[320px] object-cover"
          />
        </div>

        {/* Postcard 3 - Bottom left, rotated */}
        <div
          className="absolute left-1/2 -translate-x-1/2 ml-[-86px] top-[calc(52%+56px)] w-[260px] bg-white rounded-sm overflow-hidden -rotate-[10deg]"
          style={{
            boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <img 
            src={POSTCARD_IMAGES[2]} 
            alt="Classical building" 
            className="w-full h-[320px] object-cover"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/2 flex items-center justify-center px-12"
      >
        <div className="w-full max-w-[517px]">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-indie-flower text-[#312929] text-5xl mb-4"
          >
            Upload your picture
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#312929] text-base mb-8 leading-5"
          >
            Add a profile picture so others can recognize you (optional). You can also add your name and a short bio.
          </motion.p>

          {/* Photo Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-[#a9a8a8] rounded-lg flex flex-col items-center justify-center gap-3 hover:border-[#312929] transition-colors bg-white/50"
            >
              {photoUrl ? (
                <div className="relative w-full h-full">
                  <img 
                    src={photoUrl} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-[#a9a8a8]" />
                  <span className="font-indie-flower text-[#a9a8a8] text-xl">Click to upload your photo</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Name field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <label className="font-indie-flower text-[#312929] text-3xl block mb-2">
              name:
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              className="w-full h-12 bg-transparent border-0 border-b-2 border-[#a9a8a8] rounded-none px-0 text-xl focus:ring-0 focus:border-[#312929] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
              required
            />
          </motion.div>

          {/* Bio field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <label className="font-indie-flower text-[#312929] text-3xl block mb-2">
              bio:
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              className="w-full min-h-[80px] bg-transparent border-0 border-b-2 border-[#a9a8a8] rounded-none px-0 text-lg focus:ring-0 focus:border-[#312929] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors               resize-none"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
            onClick={handleComplete}
            disabled={!name.trim() || isLoading}
            className="w-full h-14 bg-[#322a2a] hover:bg-[#322a2a]/90 text-white text-xl font-normal rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "Complete profile"
            )}
          </Button>
          </motion.div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center"
          >
            <button
              type="button"
              onClick={() => setOnboardingStep('interests')}
              className="text-[#322a2a] text-xl underline hover:opacity-80 transition-opacity"
            >
              Back to interests
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
