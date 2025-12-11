import { useState, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

export function InterestSelection() {
  const { updateUserInterests, setOnboardingStep } = useAuth();
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newInterest = inputValue.trim().toLowerCase();
      if (!selectedInterests.includes(newInterest)) {
        setSelectedInterests([...selectedInterests, newInterest]);
      }
      setInputValue('');
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(selectedInterests.filter((i) => i !== interest));
  };

  const handleContinue = () => {
    if (selectedInterests.length >= 1) {
      updateUserInterests(selectedInterests as any);
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
            What are your interests?
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#312929] text-base mb-8 leading-5"
          >
            Add tags to help you connect with people who share your passions. Type and press Enter, or select from suggestions.
          </motion.p>

          {/* Selected Tags */}
          {selectedInterests.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-6"
            >
              {selectedInterests.map((interest, index) => (
                <motion.div
                  key={interest}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-center gap-2 px-3 py-1 bg-[#322a2a] text-white rounded-full text-sm"
                >
                  <span>{interest}</span>
                  <button
                    onClick={() => removeInterest(interest)}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Input field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Horseback riding, hiking, watercolours..."
              className="w-full h-12 bg-transparent border-0 border-b-2 border-[#a9a8a8] rounded-none px-0 text-xl font-indie-flower text-[#312929] placeholder:text-[#a9a8a8] focus:ring-0 focus:border-[#312929] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
            onClick={handleContinue}
            disabled={selectedInterests.length < 1}
            className="w-full h-14 bg-[#322a2a] hover:bg-[#322a2a]/90 text-white text-xl font-normal rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            Next: let's upload your picture
          </Button>
          </motion.div>

          {/* Back to sign up link */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => {
              setOnboardingStep('signup');
              navigate('/signup');
            }}
            className="w-full mt-4 text-[#312929] text-xl underline hover:opacity-70 transition-opacity"
          >
            Back to sign up
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
