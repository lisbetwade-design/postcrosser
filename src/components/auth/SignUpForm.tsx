import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Postcard images for the collage (same as InterestSelection)
const POSTCARD_IMAGES = [
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280467981-node-9%3A388-1765280465411.png',
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280468261-node-9%3A391-1765280465516.png',
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280467903-node-9%3A385-1765280465327.png',
];

// Stamp images (same as InterestSelection)
const STAMP_IMAGES = [
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280468533-node-9%3A482-1765280465655.png',
  'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280468611-node-9%3A383-1765280465205.png',
];

// Feather pen icon (same as InterestSelection)
const FEATHER_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765280469309-node-9%3A509-1765280469081.png';

export function SignUpForm() {
  const { signUp, signIn } = useAuth();
  const [isSignIn, setIsSignIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignIn) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
        {/* Postcard 1 - Top left, rotated */}
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
      <div className="w-1/2 flex items-center justify-center px-12">
        <div className="w-full max-w-[450px]">
          {/* Title */}
          <h1 className="font-indie-flower text-[#312929] text-6xl mb-12">
            {isSignIn ? 'Sign in' : 'Sign up'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field - only for sign up */}
            {!isSignIn && (
              <div className="space-y-2">
                <label className="font-indie-flower text-[#312929] text-3xl block">
                  name:
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 bg-transparent border-0 border-b-2 border-[#c9c8c8] rounded-none px-0 text-xl focus:ring-0 focus:border-[#312929] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  required={!isSignIn}
                />
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label className="font-indie-flower text-[#312929] text-3xl block">
                email:
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-transparent border-0 border-b-2 border-[#c9c8c8] rounded-none px-0 text-xl focus:ring-0 focus:border-[#312929] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                required
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label className="font-indie-flower text-[#312929] text-3xl block">
                password:
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-transparent border-0 border-b-2 border-[#c9c8c8] rounded-none px-0 text-xl focus:ring-0 focus:border-[#312929] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-body">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#322a2a] hover:bg-[#322a2a]/90 text-white text-xl font-body font-medium rounded-lg transition-all duration-200 mt-8"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isSignIn ? (
                "Let's send postcards"
              ) : (
                'Create profile'
              )}
            </Button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-8 text-center">
            <span className="text-[#322a2a] text-xl font-body">
              {isSignIn ? 'Not a member yet? ' : 'Already a member? '}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignIn(!isSignIn);
                setError('');
              }}
              className="text-[#322a2a] text-xl font-body underline hover:opacity-80 transition-opacity"
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
