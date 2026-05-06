import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmailChallenge from './challenges/EmailChallenge';
import LoginChallenge from './challenges/LoginChallenge';
import CodeChallenge from './challenges/CodeChallenge';

const CHALLENGES = [
  { id: 'email', component: EmailChallenge },
  { id: 'login', component: LoginChallenge },
  { id: 'code', component: CodeChallenge }
];

const Sandbox = ({ onAction }) => {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadRandomChallenge = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      // Pick a random challenge type
      const randomType = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
      // Force unmount/remount to randomize internal state of the challenge
      setCurrentChallenge({ ...randomType, key: Date.now() });
      setIsTransitioning(false);
    }, 500);
  };

  useEffect(() => {
    loadRandomChallenge();
  }, []);

  const handleChallengeAction = (payload) => {
    onAction(payload);
    // Reload a new challenge after a short delay so the user can see what they clicked
    setTimeout(loadRandomChallenge, 2000);
  };

  if (!currentChallenge) return <div className="p-8 text-zero-cyan animate-pulse">INITIALIZING_SANDBOX_ENVIRONMENT...</div>;

  const ChallengeComponent = currentChallenge.component;

  return (
    <div className="flex-1 flex flex-col items-center p-8 bg-zero-black relative overflow-y-auto">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#00FF41 1px, transparent 1px), linear-gradient(90deg, #00FF41 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="z-10 w-full max-w-3xl mb-8">
        <h2 className="text-xl text-zero-cyan mb-2">:: SANDBOX_MODE_ACTIVE</h2>
        <p className="text-gray-400 text-sm mb-6">Interact with the simulated environment below. Find the red flags, or suffer the consequences.</p>
        
        <AnimatePresence mode="wait">
          {!isTransitioning && (
            <motion.div
              key={currentChallenge.key}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
              className="bg-white/5 border border-zero-border p-6 rounded shadow-2xl shadow-zero-cyan/10"
            >
              <ChallengeComponent onAction={handleChallengeAction} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Sandbox;
