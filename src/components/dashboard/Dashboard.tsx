import { useState } from 'react';
import { Home, User, FolderOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Feather pen icon
const FEATHER_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765311281940-node-29%3A1295-1765311281571.png';

// Dice images
const DICE_IMAGE_1 = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765281007723-node-22%3A1239-1765281006347.png';
const DICE_IMAGE_2 = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765281007720-node-22%3A1240-1765281006384.png';

// Logout icon
const LOGOUT_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765281265428-node-22%3A1225-1765281265106.png';

// User avatar icon
const USER_AVATAR_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765281265424-node-12%3A1165-1765281265106.png';


type DashboardView = 'home' | 'recipient';

export function Dashboard() {
  const navigate = useNavigate();
  const { signOut, currentRecipient, assignNewRecipient, hasUnreadPostcards } = useAuth();
  const [isRolling, setIsRolling] = useState(false);
  const [view, setView] = useState<DashboardView>('home');

  const handleSendPostcard = () => {
    setIsRolling(true);
    // Roll animation for 1.5 seconds then show recipient
    setTimeout(() => {
      setIsRolling(false);
      assignNewRecipient();
      setView('recipient');
    }, 1500);
  };

  const handleTryAgain = () => {
    setView('home');
  };

  const handleCreatePostcard = () => {
    navigate('/create');
  };

  // Recipient view
  if (view === 'recipient') {
    if (!currentRecipient) {
      // If no recipient assigned, go back to home
      setView('home');
      return null;
    }
    const recipient = currentRecipient;
    
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

        {/* Main Content - Recipient Card */}
        <main className="flex flex-col items-center justify-center min-h-screen pt-[128px] px-4">
          {/* Title */}
          <h1 className="font-indie-flower text-[#312929] text-5xl mb-8 text-center">
            Your postcard goes to...
          </h1>

          {/* Recipient Card */}
          <div className="w-full max-w-[750px] bg-white rounded-lg shadow-lg p-12 mb-8">
            <div className="flex gap-8">
              {/* Avatar */}
              <div className="w-[120px] h-[120px] rounded-full border-2 border-[#312929] flex items-center justify-center flex-shrink-0">
                <img 
                  src={USER_AVATAR_ICON} 
                  alt="User avatar" 
                  className="w-16 h-16 opacity-60"
                />
              </div>

              {/* User Info */}
              <div className="flex-1">
                {/* Name */}
                <h2 className="font-indie-flower text-[#312929] text-3xl leading-9 mb-6">
                  {recipient.name}
                </h2>

                {/* Interests */}
                {recipient.interests && recipient.interests.length > 0 && (
                  <div className="mb-6">
                    <p className="font-indie-flower text-[#312929] text-xl leading-7 mb-3">
                      Interests:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipient.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-3 py-1 bg-[#322a2a] text-white text-sm font-inter rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCreatePostcard}
            className="h-14 px-16 bg-[#322a2a] hover:bg-[#322a2a]/90 text-white text-2xl font-normal rounded-lg transition-all duration-200 mb-4"
          >
            Create your postcard
          </Button>

          {/* Try again link */}
          <button
            onClick={handleTryAgain}
            className="text-[#312929] text-2xl underline hover:opacity-70 transition-opacity"
          >
            Try again
          </button>
        </main>
      </div>
    );
  }

  // Home view with dice
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
      <main className="flex flex-col items-center justify-center min-h-screen pt-[128px]">
        {/* Title */}
        <h1 className="font-indie-flower text-[#312929] text-5xl mb-16 text-center">
          Hey, let's send a new postcard!
        </h1>

        {/* Dice Images */}
        <div className="relative w-[200px] h-[180px] mb-16">
          <img 
            src={DICE_IMAGE_1} 
            alt="Dice 1" 
            className={`absolute left-0 top-0 w-[120px] h-auto transition-transform duration-300 ${
              isRolling ? 'animate-bounce' : ''
            }`}
            style={{
              animation: isRolling ? 'roll1 0.3s ease-in-out infinite' : 'none'
            }}
          />
          <img 
            src={DICE_IMAGE_2} 
            alt="Dice 2" 
            className={`absolute right-0 top-2 w-[100px] h-auto transition-transform duration-300 ${
              isRolling ? 'animate-bounce' : ''
            }`}
            style={{
              animation: isRolling ? 'roll2 0.25s ease-in-out infinite' : 'none'
            }}
          />
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleSendPostcard}
          disabled={isRolling}
          className="h-14 px-16 bg-[#322a2a] hover:bg-[#322a2a]/90 text-white text-2xl font-normal rounded-lg transition-all duration-200 disabled:opacity-70"
        >
          {isRolling ? 'Rolling...' : 'Send a postcard to...'}
        </Button>
      </main>

      {/* CSS for dice rolling animation */}
      <style>{`
        @keyframes roll1 {
          0%, 100% { transform: rotate(-5deg) translateY(0); }
          25% { transform: rotate(10deg) translateY(-10px); }
          50% { transform: rotate(-8deg) translateY(-5px); }
          75% { transform: rotate(5deg) translateY(-15px); }
        }
        @keyframes roll2 {
          0%, 100% { transform: rotate(5deg) translateY(0); }
          25% { transform: rotate(-10deg) translateY(-15px); }
          50% { transform: rotate(8deg) translateY(-8px); }
          75% { transform: rotate(-5deg) translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
