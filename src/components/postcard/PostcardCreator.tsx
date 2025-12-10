import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Home, User, FolderOpen, LogOut, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Feather pen icon
const FEATHER_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765311281940-node-29%3A1295-1765311281571.png';

// Logout icon
const LOGOUT_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765281443947-node-7%3A205-1765281443694.png';

export function PostcardCreator() {
  const navigate = useNavigate();
  const { user, currentRecipient, addPostcard, signOut, hasUnreadPostcards, uploadImage } = useAuth();
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormValid = message.trim().length > 0 && imageUrl.length > 0;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        // Upload to Supabase storage
        const url = await uploadImage(file);
        if (url) {
          setImageUrl(url);
        } else {
          // Fallback to local preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      } catch {
        // Fallback to local preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSend = async () => {
    if (!user || !currentRecipient || !isFormValid) return;

    setIsSending(true);

    try {
      await addPostcard({
        senderId: user.id,
        senderName: user.name,
        recipientId: currentRecipient.id,
        recipientName: currentRecipient.name,
        templateId: 'custom',
        message,
        imageUrl,
        stampId: 'heart',
      });

      // Navigate back after sending
      navigate('/');
    } catch (err) {
      console.error('Error sending postcard:', err);
    } finally {
      setIsSending(false);
    }
  };

  const recipientName = currentRecipient?.name || '{user}';

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

      {/* Main Content - Two Card Layout */}
      <main className="flex items-center justify-center min-h-screen pt-[128px] pb-32 px-8">
        <div className="flex gap-8 w-full max-w-[1200px]">
          {/* Left Card - Image Upload */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-8 min-h-[600px]">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {imageUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full min-h-[550px] rounded-lg overflow-hidden relative group"
              >
                <img 
                  src={imageUrl} 
                  alt="Uploaded postcard" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-12 h-12 text-white" />
                </div>
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full min-h-[200px] border-2 border-dashed border-[#c9c8c8] rounded-lg flex flex-col items-center justify-center gap-3 hover:border-[#312929] transition-colors"
              >
                <Upload className="w-8 h-8 text-[#c9c8c8]" />
                <span className="font-inter text-[#312929] text-sm">Click to upload or drag and drop</span>
                <span className="font-inter text-[#a9a8a8] text-xs">JPEG, PNG, or WebP (max 10MB)</span>
              </button>
            )}
          </div>

          {/* Right Card - Message */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-8 min-h-[600px] flex flex-col">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="flex-1 w-full min-h-[550px] bg-transparent border-0 border-b border-[#a9a8a8] rounded-none px-0 py-2 text-base font-indie-flower text-[#312929] placeholder:text-[#a9a8a8] focus:ring-0 focus:border-[#312929] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors resize-none"
            />
          </div>
        </div>
      </main>

      {/* Bottom CTA Button */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center">
        <Button
          onClick={handleSend}
          disabled={!isFormValid || isSending}
          className={`h-14 px-16 text-white text-2xl font-normal rounded-lg transition-all duration-200 ${
            isFormValid 
              ? 'bg-[#322a2a] hover:bg-[#322a2a]/90' 
              : 'bg-[#8b8585] cursor-not-allowed'
          }`}
        >
          {isSending ? 'Sending...' : `Send postcard to ${recipientName}`}
        </Button>
      </div>
    </div>
  );
}
