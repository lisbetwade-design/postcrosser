import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Reply, Home, User, FolderOpen, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import type { Postcard } from '@/types';

// Feather pen icon
const FEATHER_ICON = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765311281940-node-29%3A1295-1765311281571.png';

// Postcard image
const POSTCARD_IMAGE = 'https://storage.googleapis.com/tempo-image-previews/figma-exports%2Fuser_36OQnLpjYZWEuF92Ed0glKiLSBH-1765311281238-node-31%3A1340-1765311278750.png';

const TEMPLATES: Record<string, string> = {
  sunset: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&q=80',
  mountains: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  ocean: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80',
  flowers: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80',
  city: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80',
  forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
};

const STAMPS: Record<string, string> = {
  heart: '❤️',
  star: '⭐',
  sun: '☀️',
  moon: '🌙',
  flower: '🌸',
  wave: '🌊',
};

type FilterType = 'sent' | 'received';

export function Collection() {
  const navigate = useNavigate();
  const { user, postcards, signOut, currentRecipient, assignNewRecipient, markPostcardsAsRead } = useAuth();
  const [filter, setFilter] = useState<FilterType>('received');
  const [selectedPostcard, setSelectedPostcard] = useState<Postcard | null>(null);

  // Mark postcards as read when visiting the collection page
  React.useEffect(() => {
    markPostcardsAsRead();
  }, [markPostcardsAsRead]);

  const filteredPostcards = postcards.filter((postcard) => {
    if (filter === 'sent') return postcard.senderId === user?.id;
    if (filter === 'received') return postcard.recipientId === user?.id;
    return true;
  });

  return (
    <div className="min-h-screen relative">
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
            className="p-0 hover:opacity-70 transition-opacity"
          >
            <FolderOpen className="w-4 h-4 text-[#312929]" strokeWidth={1.5} />
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

      <div className="pt-[128px] px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="font-indie-flower text-[#322a2a] text-5xl leading-[48px]">
            My collection
          </h1>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-8 mb-8"
        >
          <button
            onClick={() => setFilter('received')}
            className={`font-indie-flower text-[#322a2a] text-xl leading-7 relative pb-2 ${
              filter === 'received' ? '' : 'opacity-70'
            }`}
          >
            Received
            {filter === 'received' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#322a2a]" />
            )}
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`font-indie-flower text-[#322a2a] text-xl leading-7 relative pb-2 ${
              filter === 'sent' ? '' : 'opacity-70'
            }`}
          >
            Sent
            {filter === 'sent' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#322a2a]" />
            )}
          </button>
        </motion.div>

        {/* Postcards Grid - Only show when user has postcards */}
        {filteredPostcards.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-[100px] gap-y-[90px] justify-items-center max-w-[1200px] mx-auto pt-[60px]"
          >
            {filteredPostcards.map((postcard, index) => (
              <motion.div
                key={postcard.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => setSelectedPostcard(postcard)}
                className="cursor-pointer group"
              >
                {/* Postcard Stack Design */}
                <div className="relative w-[375px] h-[280px]">
                  {/* Back card - Image (rotated) */}
                  <div
                    className="absolute left-0 top-[30px] w-[206px] bg-white/80 rounded-[3px] overflow-hidden border border-[#aaa8a8] -rotate-[15deg]"
                    style={{
                      boxShadow: '0px 3px 4px -2px rgba(0,0,0,0.10), 0px 8px 9px -2px rgba(0,0,0,0.10)',
                    }}
                  >
                    <img
                      src={TEMPLATES[postcard.templateId] || POSTCARD_IMAGE}
                      alt="Postcard"
                      className="w-full h-[242px] object-cover"
                    />
                  </div>
                  
                  {/* Front card - Message with actual content */}
                  <div
                    className="absolute right-0 top-0 w-[205px] h-[241px] bg-white rounded border border-[#aaa8a8]"
                    style={{
                      boxShadow: '0px 4px 5px -3px rgba(0,0,0,0.10), 0px 9px 11px -2px rgba(0,0,0,0.10)',
                    }}
                  >
                    {/* Message header line */}
                    <div className="absolute top-[29px] left-[6px] right-[6px] h-[0.5px] bg-[#a9a8a8]" />
                    {/* Message content */}
                    <p className="absolute top-[17px] left-[11px] right-[11px] text-[#322a2a] text-[10px] font-indie-flower leading-[14px] line-clamp-1">
                      {postcard.message || 'Write your message here...'}
                    </p>
                    {/* Message body preview */}
                    <p className="absolute top-[40px] left-[11px] right-[11px] text-[#666] text-[9px] font-indie-flower leading-[13px] line-clamp-6 overflow-hidden">
                      {postcard.message}
                    </p>
                    {/* From/To info */}
                    <div className="absolute bottom-[12px] left-[11px] right-[11px]">
                      <p className="text-[#8b7355] text-[8px] font-indie-flower">
                        {filter === 'received' ? `From: ${postcard.senderName}` : `To: ${postcard.recipientName}`}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State - Only show when no postcards */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <h3 className="font-indie-flower text-2xl text-[#322a2a] mb-2">
              No postcards yet
            </h3>
            <p className="text-[#8b7355]">
              {filter === 'sent'
                ? "You haven't sent any postcards yet"
                : "You haven't received any postcards yet"}
            </p>
          </motion.div>
        )}

        {/* Postcard Detail Modal */}
        <AnimatePresence>
          {selectedPostcard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedPostcard(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto"
                style={{
                  boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
                }}
              >
                <div className="relative">
                  <img
                    src={TEMPLATES[selectedPostcard.templateId] || TEMPLATES.sunset}
                    alt="Postcard"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <button
                    onClick={() => setSelectedPostcard(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5 text-[#312929]" />
                  </button>
                  <div className="absolute top-4 left-4 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center text-3xl">
                    {STAMPS[selectedPostcard.stampId || 'heart']}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs text-[#8b7355] mb-1">
                        FROM
                      </p>
                      <p className="font-indie-flower text-[#312929] text-lg">
                        {selectedPostcard.senderName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#8b7355] mb-1">
                        TO
                      </p>
                      <p className="font-indie-flower text-[#312929] text-lg">
                        {selectedPostcard.recipientName}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#e5e5e5] pt-4 mb-6">
                    <p className="text-[#312929] whitespace-pre-wrap leading-relaxed">
                      {selectedPostcard.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#8b7355]">
                      {new Date(selectedPostcard.sentAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {selectedPostcard.recipientId === user?.id && (
                      <Button
                        onClick={() => {
                          setSelectedPostcard(null);
                          if (!currentRecipient) {
                            assignNewRecipient();
                          }
                          navigate('/create');
                        }}
                        className="h-10 px-6 rounded-lg bg-[#322a2a] hover:bg-[#322a2a]/90 text-white"
                      >
                        <Reply className="mr-2 h-4 w-4" />
                        Reply
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
