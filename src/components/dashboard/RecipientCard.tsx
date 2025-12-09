import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function RecipientCard() {
  const { currentRecipient, assignNewRecipient } = useAuth();
  const [displayedName, setDisplayedName] = useState('');
  const [isRevealing, setIsRevealing] = useState(true);

  useEffect(() => {
    if (currentRecipient && isRevealing) {
      setDisplayedName('');
      const name = currentRecipient.name;
      let index = 0;

      const interval = setInterval(() => {
        if (index <= name.length) {
          setDisplayedName(name.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
          setIsRevealing(false);
        }
      }, 80);

      return () => clearInterval(interval);
    }
  }, [currentRecipient, isRevealing]);

  const handleNewRecipient = () => {
    setIsRevealing(true);
    assignNewRecipient();
  };

  if (!currentRecipient) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl p-8 soft-shadow-lg text-center max-w-md mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <Sparkles className="w-8 h-8 text-primary" />
      </motion.div>

      <p className="text-muted-foreground font-body text-sm uppercase tracking-wider mb-2">
        Your recipient is
      </p>

      <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 min-h-[48px]">
        {displayedName}
        {isRevealing && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-0.5 h-8 bg-primary ml-1 align-middle"
          />
        )}
      </h2>

      {!isRevealing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {currentRecipient.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-secondary/30 text-secondary-foreground rounded-full text-sm font-body"
              >
                {interest}
              </span>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewRecipient}
            className="text-muted-foreground hover:text-foreground font-body"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Get a different recipient
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
