import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export const Capybara = ({ onPoke, totalRestTime = 0, onPressStart, onPressEnd }: { onPoke?: () => void, totalRestTime?: number, onPressStart?: () => void, onPressEnd?: () => void }) => {
  const controls = useAnimation();
  const [isPoked, setIsPoked] = useState(false);

  // Accessories logic
  const getAccessory = () => {
    if (totalRestTime > 72000) return 'CHERRY'; // 20 hours
    if (totalRestTime > 36000) return 'STEAM'; // 10 hours
    if (totalRestTime > 18000) return 'CROWN'; // 5 hours
    if (totalRestTime > 3600) return 'TOWEL'; // 1 hour
    if (totalRestTime > 600) return 'ORANGE'; // 10 mins
    return 'NONE';
  };

  const accessory = getAccessory();

  const playSqueak = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  };

  const handlePoke = async () => {
    if (isPoked) return;
    setIsPoked(true);
    playSqueak();
    onPoke?.();
    
    await controls.start({
      scale: [1, 1.1, 0.95, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.4 }
    });
    
    setIsPoked(false);
  };

  // For Demo: Long press detection
  let timer: any;
  const startTimer = () => {
    onPressStart?.();
    timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('demo-sleep'));
    }, 1500);
  };
  const clearTimer = () => {
    onPressEnd?.();
    clearTimeout(timer);
  };

  return (
    <div 
      className="relative w-64 h-64 flex items-center justify-center cursor-pointer select-none" 
      onClick={handlePoke}
      onMouseDown={startTimer}
      onMouseUp={clearTimer}
      onTouchStart={startTimer}
      onTouchEnd={clearTimer}
    >
      {/* Shadow */}
      <motion.div 
        className="absolute bottom-16 w-32 h-4 bg-black/5 rounded-full blur-sm"
        animate={{ scaleX: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Capybara Body */}
      <motion.div
        animate={controls}
        className="relative"
      >
        <motion.div
          className="w-48 h-32 bg-[#A68B6D] rounded-[60px_80px_40px_40px] relative shadow-inner"
          animate={{
            scaleY: [1, 1.03, 1],
            y: [0, -3, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Head */}
          <div className="absolute -left-4 -top-6 w-28 h-26 bg-[#A68B6D] rounded-[45px_45px_25px_45px] shadow-sm">
            
            {/* Accessory: Orange */}
            {accessory === 'ORANGE' && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-4 left-10 w-8 h-8 bg-orange-500 rounded-full shadow-md z-10"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-green-800 rounded-full" />
              </motion.div>
            )}

            {/* Accessory: Towel */}
            {accessory === 'TOWEL' && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-3 left-6 w-16 h-6 bg-white rounded-full shadow-md z-10 flex items-center justify-center overflow-hidden"
              >
                <div className="w-full h-px bg-gray-100 mt-1" />
              </motion.div>
            )}

            {/* Accessory: Crown */}
            {accessory === 'CROWN' && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-8 left-8 w-12 h-10 text-amber-400 z-10 drop-shadow-md"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5Z" />
                </svg>
              </motion.div>
            )}

            {/* Accessory: Steam */}
            {accessory === 'STEAM' && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 z-0">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -40], 
                      opacity: [0, 0.5, 0],
                      scale: [0.5, 1.5, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      delay: i * 1,
                      ease: "easeOut"
                    }}
                    className="w-4 h-4 bg-white/30 rounded-full blur-md"
                  />
                ))}
              </div>
            )}

            {/* Accessory: Cherry Blossom */}
            {accessory === 'CHERRY' && (
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-16 -right-12 w-24 h-24 pointer-events-none z-0"
              >
                <div className="w-1 h-16 bg-[#5D4037] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
                <div className="w-16 h-16 bg-pink-200/40 rounded-full blur-xl absolute top-0 left-1/2 -translate-x-1/2" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, 40], 
                      x: [0, (i % 2 === 0 ? 10 : -10)],
                      opacity: [0, 1, 0],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      delay: i * 0.8,
                      ease: "linear"
                    }}
                    className="absolute top-4 left-1/2 w-2 h-2 bg-pink-300 rounded-full"
                  />
                ))}
              </motion.div>
            )}

            {/* Snot Bubble (鼻涕泡) */}
            <motion.div
              className="absolute left-1 top-14 w-4 h-4 bg-white/40 border border-white/60 rounded-full blur-[1px]"
              animate={{
                scale: [0.5, 2.5, 0.5],
                opacity: [0.2, 0.6, 0.2],
                x: [-2, 0, -2]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Eye - Sleepy/Blinking */}
            <motion.div 
              className="absolute right-8 top-12 w-3 h-1.5 bg-[#3D2B1F] rounded-full"
              animate={{
                scaleY: [1, 0.1, 1, 1, 0.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                times: [0, 0.02, 0.04, 0.9, 0.92, 1],
                ease: "easeInOut"
              }}
            />
            {/* Nose */}
            <div className="absolute left-3 top-14 w-5 h-4 bg-[#3D2B1F] rounded-full opacity-40" />
            {/* Ear */}
            <motion.div 
              className="absolute right-3 top-2 w-5 h-5 bg-[#8C7358] rounded-full"
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          
          {/* Legs */}
          <div className="absolute bottom-0 left-10 w-5 h-3 bg-[#8C7358] rounded-b-xl" />
          <div className="absolute bottom-0 right-14 w-5 h-3 bg-[#8C7358] rounded-b-xl" />
        </motion.div>
      </motion.div>

      {/* Floating Zzz */}
      <AnimateZzz delay={0} />
      <AnimateZzz delay={1.5} />
      
      {/* Interaction Ripple */}
      <AnimatePresence>
        {isPoked && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 border-4 border-[#A68B6D] rounded-full pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AnimateZzz = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute top-0 right-4 text-[#8C7358] font-mono text-2xl font-bold opacity-0 pointer-events-none"
    animate={{ 
      opacity: [0, 0.8, 0],
      y: [-20, -80],
      x: [0, 15, -5],
      scale: [0.8, 1.2, 1]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeOut"
    }}
  >
    z
  </motion.div>
);
